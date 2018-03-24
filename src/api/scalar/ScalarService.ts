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

@Path("/api/v1/scalar")
export class ScalarService {

    public static async getTokenOwner(scalarToken: string, ignoreUpstreams?: boolean): Promise<string> {
        const cachedUserId = Cache.for(CACHE_SCALAR_ACCOUNTS).get(scalarToken);
        if (cachedUserId) return cachedUserId;

        const user = await ScalarStore.getTokenOwner(scalarToken, ignoreUpstreams);
        if (!user) throw new ApiError(401, "Invalid token");

        Cache.for(CACHE_SCALAR_ACCOUNTS).put(scalarToken, user.userId, 30 * 60 * 1000); // 30 minutes
        return user.userId;
    }

    @POST
    @Path("register")
    public async register(request: RegisterRequest): Promise<ScalarRegisterResponse> {
        const mxClient = new MatrixOpenIdClient(<OpenId>request);
        const mxUserId = await mxClient.getUserId();

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

        return {scalar_token: dimensionScalarToken.scalarToken};
    }

    @GET
    @Path("account")
    public async getAccount(@QueryParam("scalar_token") scalarToken: string): Promise<ScalarAccountResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);
        return {user_id: userId};
    }

}