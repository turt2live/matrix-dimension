import { ILoggedInUser } from "../security/MatrixSecurity";
import TermsRecord from "../../db/models/TermsRecord";
import TermsTextRecord from "../../db/models/TermsTextRecord";
import TermsSignedRecord from "../../db/models/TermsSignedRecord";
import { Op } from "sequelize";
import { Cache, CACHE_TERMS } from "../../MemoryCache";
import UserScalarToken from "../../db/models/UserScalarToken";
import Upstream from "../../db/models/Upstream";
import { LogService } from "matrix-js-snippets";
import { ScalarClient } from "../../scalar/ScalarClient";
import { md5 } from "../../utils/hashing";
import TermsUpstreamRecord from "../../db/models/TermsUpstreamRecord";
import { ScalarStore } from "../../db/ScalarStore";

export interface ILanguagePolicy {
    name: string;
    url: string;
}

export interface IPolicy {
    version: string;

    // a string value is not allowed here, but TypeScript is angry otherwise.
    [language: string]: string | ILanguagePolicy;
}

export interface ITermsResponse {
    policies: { [policyName: string]: IPolicy };
}

export interface ITerms {
    shortcode: string;
    version: string;
    languages: {
        [lang: string]: {
            name: string;
            url: string;
            text?: string;
        };
    };
}

export interface ICachedTerms extends ITerms {
    id: number;
}

export const VERSION_DRAFT = "draft";

/**
 * API controller for terms of service management
 */
export default class TermsController {
    private async getPublishedTerms(): Promise<ICachedTerms[]> {
        const cache = Cache.for(CACHE_TERMS);

        let terms = cache.get("published");
        if (terms) return terms;

        terms = (await TermsRecord.findAll({
            where: {version: {[Op.ne]: VERSION_DRAFT}},
            include: [TermsTextRecord],
        }));

        const latest: { [shortcode: string]: TermsRecord } = {};
        for (const record of terms) {
            if (!latest[record.shortcode]) {
                latest[record.shortcode] = record;
            }
            if (latest[record.shortcode].id < record.id) {
                latest[record.shortcode] = record;
            }
        }

        terms = Object.values(latest).map(p => {
            const mapped = this.mapPolicy(false, p);
            return <ICachedTerms>Object.assign({}, mapped, {
                id: p.id,
            });
        });
        cache.put("published", terms);

        return terms;
    }

    public async doesUserNeedToSignTerms(user: ILoggedInUser): Promise<boolean> {
        const latest = await this.getPublishedTerms();
        const signed = await TermsSignedRecord.findAll({where: {userId: user.userId}});

        const missing = Object.values(latest).filter(d => !signed.find(s => s.termsId === d.id));
        if (missing.length > 0) return true;

        // Test upstream terms for the user
        const tokensForUser = await UserScalarToken.findAll({where: {userId: user.userId}, include: [Upstream]});
        const upstreamTokens = tokensForUser.filter(t => t.upstream);
        for (const upstreamToken of upstreamTokens) {
            try {
                const online = await ScalarStore.isUpstreamOnline(upstreamToken.upstream, ScalarClient.KIND_MATRIX_V1);
                if (!online) {
                    LogService.warn("TermsController", `Upstream ${upstreamToken.upstream.id} is offline - skipping terms check`);
                    continue;
                }

                const scalarClient = new ScalarClient(upstreamToken.upstream, ScalarClient.KIND_MATRIX_V1);
                await scalarClient.getAccount(upstreamToken.scalarToken);
                // 200 OK means we're fine
            } catch (e) {
                if (e.statusCode === 403 && e.body && e.body.errcode === 'M_TERMS_NOT_SIGNED') {
                    return true;
                }
            }
        }

        return false;
    }

    public async getAvailableTerms(): Promise<ITermsResponse> {
        const latest = await this.getPublishedTerms();
        const policies: ITermsResponse = {policies: {}};

        for (const termsPolicy of Object.values(latest)) {
            policies.policies[termsPolicy.shortcode] = {
                version: termsPolicy.version,
            };

            for (const language in termsPolicy.languages) {
                policies.policies[termsPolicy.shortcode][language] = {
                    name: termsPolicy.languages[language].name,
                    url: termsPolicy.languages[language].url,
                };
            }
        }

        // Get upstream terms
        const usptreams = await Upstream.findAll();
        const urlsToUpstream = {}; // {url: [upstreamId]}
        for (const upstream of usptreams) {
            try {
                const scalarClient = new ScalarClient(upstream, ScalarClient.KIND_MATRIX_V1);
                const upstreamTerms = await scalarClient.getAvailableTerms();

                // rewrite the shortcodes to avoid conflicts
                const shortcodePrefix = `upstream_${md5(`${upstream.id}:${upstream.apiUrl}`)}`;
                for (const shortcode of Object.keys(upstreamTerms.policies)) {
                    policies.policies[`${shortcodePrefix}_${shortcode}`] = upstreamTerms.policies[shortcode];

                    // copy all urls for later adding to the database
                    for (const language of Object.keys(upstreamTerms.policies[shortcode])) {
                        const upstreamUrl = upstreamTerms.policies[shortcode][language]['url'];
                        if (!urlsToUpstream[upstreamUrl]) urlsToUpstream[upstreamUrl] = [];
                        const upstreamsArr = urlsToUpstream[upstreamUrl];
                        if (!upstreamsArr.includes(upstream.id)) {
                            upstreamsArr.push(upstream.id);
                        }
                    }
                }
            } catch (e) {
                LogService.error("TermsController", e);
            }
        }

        // actually cache the urls in the database
        const existingCache = await TermsUpstreamRecord.findAll({where: {url: {[Op.in]: Object.keys(urlsToUpstream)}}});
        for (const upstreamUrl of Object.keys(urlsToUpstream)) {
            const upstreamIds = urlsToUpstream[upstreamUrl];
            const existingIds = existingCache.filter(c => c.url === upstreamUrl).map(c => c.upstreamId);
            const missingIds = upstreamIds.filter(i => !existingIds.includes(i));
            for (const targetUpstreamId of missingIds) {
                const item = await TermsUpstreamRecord.create({url: upstreamUrl, upstreamId: targetUpstreamId});
                existingCache.push(item);
            }
        }

        return policies;
    }

    public async signTermsMatching(user: ILoggedInUser, urls: string[]): Promise<any> {
        const terms = await TermsTextRecord.findAll({where: {url: {[Op.in]: urls}}});
        const signed = await TermsSignedRecord.findAll({where: {userId: user.userId}});

        const toAdd = terms.filter(t => !signed.find(s => s.termsId === t.termsId));
        for (const termsToSign of toAdd) {
            await TermsSignedRecord.create({termsId: termsToSign.id, userId: user.userId});
        }

        // Check upstreams too, if there are any
        const upstreamPolicies = await TermsUpstreamRecord.findAll({
            where: {url: {[Op.in]: urls}},
            include: [Upstream]
        });
        const upstreamsToSignatures: { [upstreamId: number]: { upstream: Upstream, token: string, urls: string[] } } = {};
        for (const upstreamPolicy of upstreamPolicies) {
            const userToken = await UserScalarToken.findOne({
                where: {
                    upstreamId: upstreamPolicy.upstreamId,
                    userId: user.userId,
                },
            });
            if (!userToken) {
                LogService.warn("TermsController", `User ${user.userId} is missing an upstream token for ${upstreamPolicy.upstream.scalarUrl}`);
                continue;
            }

            if (!upstreamsToSignatures[upstreamPolicy.upstreamId]) upstreamsToSignatures[upstreamPolicy.upstreamId] = {
                upstream: upstreamPolicy.upstream,
                token: userToken.scalarToken,
                urls: [],
            };
            upstreamsToSignatures[upstreamPolicy.upstreamId].urls.push(upstreamPolicy.url);
        }

        for (const upstreamSignature of Object.values(upstreamsToSignatures)) {
            const client = new ScalarClient(upstreamSignature.upstream, ScalarClient.KIND_MATRIX_V1);
            await client.signTermsUrls(upstreamSignature.token, upstreamSignature.urls);
        }
    }

    public async getPoliciesForAdmin(): Promise<ITerms[]> {
        const terms = await TermsRecord.findAll({include: [TermsTextRecord]});
        return terms.map(this.mapPolicy.bind(this, false));
    }

    public async getPolicyForAdmin(shortcode: string, version: string): Promise<ITerms> {
        const terms = await TermsRecord.findOne({where: {shortcode, version}, include: [TermsTextRecord]});
        return this.mapPolicy(true, terms);
    }

    public async createDraftPolicy(name: string, shortcode: string, text: string, url: string): Promise<ITerms> {
        const terms = await TermsRecord.create({shortcode, version: VERSION_DRAFT});
        const termsText = await TermsTextRecord.create({termsId: terms.id, language: "en", name, text, url});

        terms.texts = [termsText];
        return this.mapPolicy(true, terms);
    }

    public async updatePolicy(name: string, shortcode: string, version: string, text: string, url: string): Promise<ITerms> {
        const terms = await TermsRecord.findOne({where: {shortcode, version}, include: [TermsTextRecord]});
        const termsText = terms.texts.find(e => e.language === "en");

        termsText.url = url;
        termsText.text = text;
        termsText.name = name;

        await termsText.save();
        Cache.for(CACHE_TERMS).clear();

        return this.mapPolicy(true, terms);
    }

    public async publishPolicy(shortcode: string, targetVersion: string): Promise<ITerms> {
        const terms = await TermsRecord.findOne({
            where: {shortcode, version: VERSION_DRAFT},
            include: [TermsTextRecord],
        });
        if (!terms) throw new Error("Missing terms");

        terms.version = targetVersion;
        await terms.save();
        Cache.for(CACHE_TERMS).clear();

        return this.mapPolicy(true, terms);
    }

    private mapPolicy(withText: boolean, policy: TermsRecord): ITerms {
        const languages = {};
        policy.texts.forEach(pt => languages[pt.language] = {
            name: pt.name,
            url: pt.url,
            text: withText ? pt.text : null,
        });
        return {
            shortcode: policy.shortcode,
            version: policy.version,
            languages: languages,
        };
    }
}