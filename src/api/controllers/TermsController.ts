import { AutoWired } from "typescript-ioc/es6";
import { IMSCUser } from "../security/MSCSecurity";
import TermsRecord from "../../db/models/TermsRecord";
import TermsTextRecord from "../../db/models/TermsTextRecord";
import TermsSignedRecord from "../../db/models/TermsSignedRecord";
import { Op } from "sequelize";
import { Cache, CACHE_TERMS } from "../../MemoryCache";

export interface ILanguagePolicy {
    name: string;
    url: string;
}

export interface IPolicy {
    version: string;

    // a string value is not allowed here, but TypeScript is angry otherwise.
    [language: string]: string | ILanguagePolicy;
}

export interface ITermsNotSignedResponse {
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
@AutoWired
export default class TermsController {
    constructor() {
    }

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

    public async doesUserNeedToSignTerms(user: IMSCUser): Promise<boolean> {
        return Object.keys((await this.getMissingTermsForUser(user)).policies).length > 0;
    }

    public async getMissingTermsForUser(user: IMSCUser): Promise<ITermsNotSignedResponse> {
        // TODO: Upstream policies

        const latest = await this.getPublishedTerms();
        const signed = await TermsSignedRecord.findAll({where: {userId: user.userId}});

        const missing = Object.values(latest).filter(d => !signed.find(s => s.termsId === d.id));
        const policies: ITermsNotSignedResponse = {policies: {}};

        for (const missingPolicy of missing) {
            policies.policies[missingPolicy.shortcode] = {
                version: missingPolicy.version,
            };

            for (const language in missingPolicy.languages) {
                policies.policies[missingPolicy.shortcode][language] = {
                    name: missingPolicy.languages[language].name,
                    url: missingPolicy.languages[language].url,
                };
            }
        }

        return policies;
    }

    public async signTermsMatching(user: IMSCUser, urls: string[]): Promise<any> {
        const terms = await TermsTextRecord.findAll({where: {url: {[Op.in]: urls}}});
        const signed = await TermsSignedRecord.findAll({where: {userId: user.userId}});

        const toAdd = terms.filter(t => !signed.find(s => s.termsId === t.termsId));
        for (const termsToSign of toAdd) {
            await TermsSignedRecord.create({termsId: termsToSign.id, userId: user.userId});
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