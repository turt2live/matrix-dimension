import * as Promise from "bluebird";
import UserScalarToken from "./models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import Upstream from "./models/Upstream";
import User from "./models/User";

export class ScalarStore {

    public static doesUserHaveTokensForAllUpstreams(userId: string): Promise<boolean> {
        let upstreamTokenIds: number[] = [];
        let hasDimensionToken = false;
        return UserScalarToken.findAll({where: {userId: userId}}).then(results => {
            upstreamTokenIds = results.filter(t => !t.isDimensionToken).map(t => t.upstreamId);
            hasDimensionToken = results.filter(t => t.isDimensionToken).length >= 1;
            return Upstream.findAll();
        }).then(upstreams => {
            if (!hasDimensionToken) {
                LogService.warn("DimensionStore", "User " + userId + " is missing a Dimension scalar token");
                return false;
            }

            for (const upstream of upstreams) {
                if (upstreamTokenIds.indexOf(upstream.id) === -1) {
                    LogService.warn("DimensionStore", "User " + userId + " is missing a scalar token for upstream " + upstream.id + " (" + upstream.name + ")");
                    return false;
                }
            }

            return true;
        });
    }

    public static getTokenOwner(scalarToken: string): Promise<User> {
        let user: User = null;
        return UserScalarToken.findAll({
            where: {isDimensionToken: true, scalarToken: scalarToken},
            include: [User]
        }).then(tokens => {
            if (!tokens || tokens.length === 0) {
                return Promise.reject("Invalid token");
            }

            user = tokens[0].user;
            return ScalarStore.doesUserHaveTokensForAllUpstreams(user.userId);
        }).then(hasUpstreams => {
            if (!hasUpstreams) {
                return Promise.reject("Invalid token"); // missing one or more upstreams == no validation
            }
            return Promise.resolve(user);
        });
    }

    private constructor() {
    }
}