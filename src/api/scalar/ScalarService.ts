import { GET, Path, POST, QueryParam } from "typescript-rest";
import { MatrixOpenIdClient } from "../../matrix/MatrixOpenIdClient";
import Upstream from "../../db/models/Upstream";
import { ScalarClient } from "../../scalar/ScalarClient";
import User from "../../db/models/User";
import UserScalarToken from "../../db/models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import * as randomString from "random-string";
import { OpenId } from "../../models/OpenId";
import { ScalarAccountResponse, ScalarRegisterResponse } from "../../models/ScalarResponses";
import { Cache, CACHE_SCALAR_ACCOUNTS } from "../../MemoryCache";
import { ScalarStore } from "../../db/ScalarStore";

interface RegisterRequest {
    access_token: string;
    token_type: string;
    matrix_server_name: string;
    expires_in: number;
}

/**
 * API for the minimum Scalar API we need to implement to be compatible with clients. Used for registration
 * and general account management.
 */
@Path("/api/v1/scalar")
export class ScalarService {

    /**
     * Gets the owner of a given scalar token, throwing an ApiError if the token is invalid.
     * @param {string} scalarToken The scalar token to validate
     * @param {boolean} ignoreUpstreams True to consider the token valid if it is missing links to other upstreams
     * @returns {Promise<string>} Resolves to the owner's user ID if the token is valid.
     * @throws {ApiError} Thrown with a status code of 401 if the token is invalid.
     */
    public static async getTokenOwner(scalarToken: string, ignoreUpstreams?: boolean): Promise<string> {
        const cachedUserId = Cache.for(CACHE_SCALAR_ACCOUNTS).get(scalarToken);
        if (cachedUserId) return cachedUserId;

        try {
            const user = await ScalarStore.getTokenOwner(scalarToken, ignoreUpstreams);
            Cache.for(CACHE_SCALAR_ACCOUNTS).put(scalarToken, user.userId, 30 * 60 * 1000); // 30 minutes
            return user.userId;
        } catch (err) {
            LogService.error("ScalarService", err);
            throw new ApiError(401, "Invalid token");
        }
    }

    @POST
    @Path("register")
    public async register(request: RegisterRequest): Promise<ScalarRegisterResponse> {
        const mxClient = new MatrixOpenIdClient(<OpenId>request);
        const mxUserId = await mxClient.getUserId();

        if (!mxUserId.endsWith(":" + request.matrix_server_name)) {
            LogService.warn("ScalarService", `OpenID subject '${mxUserId}' does not belong to the homeserver '${request.matrix_server_name}'`);
            throw new ApiError(401, "Invalid token");
        }

        const user = await User.findByPrimary(mxUserId);
        if (!user) {
            // There's a small chance we'll get a validation error because of:
            // https://github.com/vector-im/riot-web/issues/5846
            LogService.verbose("ScalarService", "User " + mxUserId + " never seen before - creating");
            await User.create({userId: mxUserId});
        }

        const upstreams = await Upstream.findAll();
        await Promise.all(upstreams.map(async upstream => {
            const tokens = await UserScalarToken.findAll({where: {userId: mxUserId, upstreamId: upstream.id}});
            if (!tokens || tokens.length === 0) {
                LogService.info("ScalarService", "Registering " + mxUserId + " for a token at upstream " + upstream.id + " (" + upstream.name + ")");
                const client = new ScalarClient(upstream);
                const response = await client.register(<OpenId>request);
                return UserScalarToken.create({
                    userId: mxUserId,
                    scalarToken: response.scalar_token,
                    isDimensionToken: false,
                    upstreamId: upstream.id,
                });
            }
        }));

        const dimensionToken = randomString({length: 25});
        const dimensionScalarToken = await UserScalarToken.create({
            userId: mxUserId,
            scalarToken: dimensionToken,
            isDimensionToken: true,
        });

        LogService.info("ScalarService", mxUserId + " has registered for a scalar token successfully");
        return {scalar_token: dimensionScalarToken.scalarToken};
    }

    @GET
    @Path("account")
    public async getAccount(@QueryParam("scalar_token") scalarToken: string): Promise<ScalarAccountResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);
        return {user_id: userId};
    }

}