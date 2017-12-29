import { GET, Path, POST, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
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

    public static getTokenOwner(scalarToken: string, ignoreUpstreams?: boolean): Promise<string> {
        const cachedUserId = Cache.for(CACHE_SCALAR_ACCOUNTS).get(scalarToken);
        if (cachedUserId) return Promise.resolve(cachedUserId);

        return ScalarStore.getTokenOwner(scalarToken, ignoreUpstreams).then(user => {
            if (!user) return Promise.reject("Invalid token");
            Cache.for(CACHE_SCALAR_ACCOUNTS).put(scalarToken, user.userId, 30 * 60 * 1000); // 30 minutes
            return Promise.resolve(user.userId);
        });
    }

    public static invalidTokenErrorHandler(error: any): any {
        if (error !== "Invalid token") {
            LogService.error("ScalarWidgetService", "Error processing request");
            LogService.error("ScalarWidgetService", error);
        }
        throw new ApiError(401, {message: "Invalid token"});
    }

    @POST
    @Path("register")
    public register(request: RegisterRequest): Promise<ScalarRegisterResponse> {
        let userId = null;
        const mxClient = new MatrixOpenIdClient(<OpenId>request);
        return mxClient.getUserId().then(mxUserId => {
            userId = mxUserId;
            return User.findByPrimary(userId).then(user => {
                if (!user) {
                    // There's a small chance we'll get a validation error because of:
                    // https://github.com/vector-im/riot-web/issues/5846
                    LogService.verbose("ScalarService", "User " + userId + " never seen before - creating");
                    return User.create({userId: userId});
                }
            });
        }).then(() => {
            return Upstream.findAll();
        }).then(upstreams => {
            return Promise.all(upstreams.map(u => {
                return UserScalarToken.findAll({where: {userId: userId, upstreamId: u.id}}).then(tokens => {
                    if (!tokens || tokens.length === 0) {
                        LogService.info("ScalarService", "Registering " + userId + " for token at upstream " + u.id + " (" + u.name + ")");
                        const client = new ScalarClient(u);
                        return client.register(<OpenId>request).then(registerResponse => {
                            return UserScalarToken.create({
                                userId: userId,
                                scalarToken: registerResponse.scalar_token,
                                isDimensionToken: false,
                                upstreamId: u.id,
                            });
                        });
                    }
                });
            }));
        }).then(() => {
            const dimensionToken = randomString({length: 25});
            return UserScalarToken.create({
                userId: userId,
                scalarToken: dimensionToken,
                isDimensionToken: true,
            });
        }).then(userToken => {
            return {scalar_token: userToken.scalarToken};
        }).catch(err => {
            LogService.error("ScalarService", err);
            throw new ApiError(401, {message: "Failed to authenticate user"});
        });
    }

    @GET
    @Path("account")
    public getAccount(@QueryParam("scalar_token") scalarToken: string): Promise<ScalarAccountResponse> {
        return ScalarService.getTokenOwner(scalarToken).then(userId => {
            return {user_id: userId};
        }, ScalarService.invalidTokenErrorHandler);
    }

}