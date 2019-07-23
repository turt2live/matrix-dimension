import { OpenId } from "../../models/OpenId";
import { MatrixOpenIdClient } from "../../matrix/MatrixOpenIdClient";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import User from "../../db/models/User";
import Upstream from "../../db/models/Upstream";
import { ScalarStore } from "../../db/ScalarStore";
import UserScalarToken from "../../db/models/UserScalarToken";
import { ScalarClient } from "../../scalar/ScalarClient";
import * as randomString from "random-string";
import { AutoWired } from "typescript-ioc/es6";
import { Cache, CACHE_SCALAR_ACCOUNTS } from "../../MemoryCache";
import { ILoggedInUser } from "../security/MatrixSecurity";

export interface IAccountRegisteredResponse {
    token: string;
}

export interface IAccountInfoResponse {
    user_id: string;
}

/**
 * API controller for account management
 */
@AutoWired
export default class AccountController {
    constructor() {
    }

    /**
     * Gets the owner of a given scalar token, throwing an ApiError if the token is invalid.
     * @param {string} scalarToken The scalar token to validate
     * @returns {Promise<string>} Resolves to the owner's user ID if the token is valid.
     * @throws {ApiError} Thrown with a status code of 401 if the token is invalid.
     */
    public async getTokenOwner(scalarToken: string): Promise<string> {
        const cachedUserId = Cache.for(CACHE_SCALAR_ACCOUNTS).get(scalarToken);
        if (cachedUserId) return cachedUserId;

        try {
            const user = await ScalarStore.getTokenOwner(scalarToken);
            Cache.for(CACHE_SCALAR_ACCOUNTS).put(scalarToken, user.userId, 30 * 60 * 1000); // 30 minutes
            return user.userId;
        } catch (err) {
            LogService.error("ScalarService", err);
            throw new ApiError(401, "Invalid token");
        }
    }

    /**
     * Registers an account to use the Integration Manager
     * @param {OpenId} openId The OpenID request information.
     * @param {string} scalarKind The kind of scalar client to use.
     * @returns {Promise<IAccountRegisteredResponse>} Resolves when registered.
     */
    public async registerAccount(openId: OpenId, scalarKind: string): Promise<IAccountRegisteredResponse> {
        if (!openId || !openId.matrix_server_name || !openId.access_token) {
            throw new ApiError(400, "Missing OpenID information");
        }

        const mxClient = new MatrixOpenIdClient(openId);
        const mxUserId = await mxClient.getUserId();

        if (!mxUserId.endsWith(":" + openId.matrix_server_name)) {
            LogService.warn("AccountController", `OpenID subject '${mxUserId}' does not belong to the homeserver '${openId.matrix_server_name}'`);
            throw new ApiError(401, "Invalid token");
        }

        const user = await User.findByPk(mxUserId);
        if (!user) {
            // There's a small chance we'll get a validation error because of:
            // https://github.com/vector-im/riot-web/issues/5846
            LogService.verbose("AccountController", "User " + mxUserId + " never seen before - creating");
            await User.create({userId: mxUserId});
        }

        const upstreams = await Upstream.findAll();
        await Promise.all(upstreams.map(async upstream => {
            if (!await ScalarStore.isUpstreamOnline(upstream, scalarKind)) {
                LogService.warn("AccountController", `Skipping registration for ${mxUserId} on upstream ${upstream.id} (${upstream.name}) because it is offline`);
                return null;
            }
            const tokens = await UserScalarToken.findAll({where: {userId: mxUserId, upstreamId: upstream.id}});
            if (!tokens || tokens.length === 0) {
                LogService.info("AccountController", "Registering " + mxUserId + " for a token at upstream " + upstream.id + " (" + upstream.name + ")");
                const client = new ScalarClient(upstream);
                const response = await client.register(openId);
                return UserScalarToken.create({
                    userId: mxUserId,
                    scalarToken: response.scalar_token,
                    isDimensionToken: false,
                    upstreamId: upstream.id,
                });
            }
        }).filter(token => !!token));

        const dimensionToken = randomString({length: 25});
        const dimensionScalarToken = await UserScalarToken.create({
            userId: mxUserId,
            scalarToken: dimensionToken,
            isDimensionToken: true,
        });

        LogService.info("AccountController", mxUserId + " has registered for a scalar token successfully");
        return {token: dimensionScalarToken.scalarToken};
    }

    /**
     * Logs a user out
     * @param {ILoggedInUser} user The user to log out
     * @returns {Promise<*>} Resolves when complete.
     */
    public async logout(user: ILoggedInUser): Promise<any> {
        const tokens = await UserScalarToken.findAll({where: {scalarToken: user.token}, include: [Upstream]});
        for (const token of tokens) {
            if (token.upstream) {
                LogService.info("AccountController", "Logging user out of upstream");
                const client = new ScalarClient(token.upstream, ScalarClient.KIND_MATRIX_V1);
                await client.logout(token.scalarToken);
            }
            await token.destroy();
        }
        Cache.for(CACHE_SCALAR_ACCOUNTS).clear();
        return {};
    }
}