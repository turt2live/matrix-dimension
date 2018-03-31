import UserScalarToken from "./models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import Upstream from "./models/Upstream";
import User from "./models/User";

export class ScalarStore {

    public static async doesUserHaveTokensForAllUpstreams(userId: string): Promise<boolean> {
        const scalarTokens = await UserScalarToken.findAll({where: {userId: userId}});
        const upstreamTokenIds = scalarTokens.filter(t => !t.isDimensionToken).map(t => t.upstreamId);
        const hasDimensionToken = scalarTokens.filter(t => t.isDimensionToken).length >= 1;

        if (!hasDimensionToken) {
            LogService.warn("ScalarStore", "User " + userId + " is missing a Dimension scalar token");
            return false;
        }

        const upstreams = await Upstream.findAll();
        for (const upstream of upstreams) {
            if (upstreamTokenIds.indexOf(upstream.id) === -1) {
                LogService.warn("ScalarStore", "user " + userId + " is missing a scalar token for upstream " + upstream.id + " (" + upstream.name + ")");
                return false;
            }
        }

        return true;
    }

    public static async getTokenOwner(scalarToken: string, ignoreUpstreams?: boolean): Promise<User> {
        const tokens = await UserScalarToken.findAll({
            where: {isDimensionToken: true, scalarToken: scalarToken},
            include: [User]
        });
        if (!tokens || tokens.length === 0) throw new Error("Invalid token");

        const user = tokens[0].user;
        if (ignoreUpstreams) return user; // skip upstreams check

        const hasAllTokens = await ScalarStore.doesUserHaveTokensForAllUpstreams(user.userId);
        if (!hasAllTokens) {
            throw new Error("Invalid token"); // They are missing an upstream, so we'll lie and say they are not authorized
        }
        return user;
    }

    private constructor() {
    }
}