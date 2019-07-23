import UserScalarToken from "./models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import Upstream from "./models/Upstream";
import User from "./models/User";
import { MatrixStickerBot } from "../matrix/MatrixStickerBot";
import { ScalarClient } from "../scalar/ScalarClient";
import { Cache, CACHE_SCALAR_ONLINE_STATE } from "../MemoryCache";
import { ILanguagePolicy } from "../api/controllers/TermsController";

export class ScalarStore {

    public static async doesUserHaveTokensForAllUpstreams(userId: string, scalarKind: string): Promise<boolean> {
        const scalarTokens = await UserScalarToken.findAll({where: {userId: userId}});
        const upstreamTokenIds = scalarTokens.filter(t => !t.isDimensionToken).map(t => t.upstreamId);
        const hasDimensionToken = scalarTokens.filter(t => t.isDimensionToken).length >= 1;

        if (!hasDimensionToken) {
            LogService.warn("ScalarStore", "User " + userId + " is missing a Dimension scalar token");
            return false;
        }

        const upstreams = await Upstream.findAll();
        for (const upstream of upstreams) {
            if (!await ScalarStore.isUpstreamOnline(upstream, scalarKind)) {
                LogService.warn("ScalarStore", `Upstream ${upstream.apiUrl} is offline - assuming token is valid`);
                continue;
            }
            if (upstreamTokenIds.indexOf(upstream.id) === -1) {
                LogService.warn("ScalarStore", "user " + userId + " is missing a scalar token for upstream " + upstream.id + " (" + upstream.name + ")");
                return false;
            }
        }

        return true;
    }

    public static async getTokenOwner(scalarToken: string): Promise<User> {
        const tokens = await UserScalarToken.findAll({
            where: {isDimensionToken: true, scalarToken: scalarToken},
            include: [User]
        });
        if (!tokens || tokens.length === 0) throw new Error("Invalid token");

        return tokens[0].user;
    }

    public static async isUpstreamOnline(upstream: Upstream, scalarKind: string): Promise<boolean> {
        const cache = Cache.for(CACHE_SCALAR_ONLINE_STATE);
        const cacheKey = `Upstream ${upstream.id}`;
        const result = cache.get(cacheKey);
        if (typeof (result) === 'boolean') {
            return result;
        }

        const state = ScalarStore.checkIfUpstreamOnline(upstream, scalarKind);
        cache.put(cacheKey, state, 60 * 60 * 1000); // 1 hour
        return state;
    }

    private static async checkIfUpstreamOnline(upstream: Upstream, scalarKind: string, signTerms = true): Promise<boolean> {
        try {
            // The sticker bot can be used for this for now

            const testUserId = await MatrixStickerBot.getUserId();
            const scalarClient = new ScalarClient(upstream, scalarKind);

            // First see if we have a token for the upstream so we can try it
            const existingTokens = await UserScalarToken.findAll({
                where: {isDimensionToken: false, userId: testUserId, upstreamId: upstream.id},
            });
            if (existingTokens && existingTokens.length) {
                // Test that the token works
                try {
                    const result = await scalarClient.getAccount(existingTokens[0].scalarToken);
                    if (result.user_id !== testUserId) {
                        // noinspection ExceptionCaughtLocallyJS
                        throw new Error(`Unexpected error: Upstream ${upstream.id} did not return account info for the right token`);
                    }
                    return true; // it's online
                } catch (e) {
                    LogService.error("ScalarStore", e);
                    if (e && !isNaN(Number(e.statusCode))) {
                        if (e.statusCode === 403 && e.body) {
                            if (e.body.errcode === 'M_TERMS_NOT_SIGNED' && signTerms) {
                                await ScalarStore.signAllTerms(existingTokens[0], scalarKind);
                                return ScalarStore.checkIfUpstreamOnline(upstream, scalarKind, false);
                            }
                        }
                        if (e.statusCode === 401 || e.statusCode === 403) {
                            LogService.info("ScalarStore", "Test user token expired");
                        } else {
                            // Assume offline
                            return false;
                        }
                    }
                }
            }

            // If we're here, we need to register a new token

            if (existingTokens && existingTokens.length) {
                for (const token of existingTokens) {
                    await token.destroy();
                }
            }

            const user = await User.findByPk(testUserId);
            if (!user) {
                await User.create({
                    userId: testUserId,
                    isSelfBot: true,
                });
            }

            const openId = await MatrixStickerBot.getOpenId();
            const token = await scalarClient.register(openId);
            const scalarToken = await UserScalarToken.create({
                userId: testUserId,
                scalarToken: token.scalar_token,
                isDimensionToken: false,
                upstreamId: upstream.id,
            });

            // Accept all terms of service for the user
            await ScalarStore.signAllTerms(scalarToken, scalarKind);

            return true;
        } catch (e) {
            LogService.error("ScalarStore", e);
            return false;
        }
    }

    private static async signAllTerms(token: UserScalarToken, scalarKind: string) {
        try {
            const client = new ScalarClient(token.upstream, scalarKind);
            const terms = await client.getAvailableTerms();
            const urlsToSign = Object.values(terms.policies).map(p => {
                const englishCode = Object.keys(p).find(k => k.toLowerCase() === 'en' || k.toLowerCase().startsWith('en_'));
                if (!englishCode) return null;
                return (<ILanguagePolicy>p[englishCode]).url;
            }).filter(v => !!v);
            await client.signTermsUrls(token.scalarToken, urlsToSign);
        } catch (e) {
            LogService.error("ScalarStore", e);
        }
    }

    private constructor() {
    }
}