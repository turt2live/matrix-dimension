import { AutoWired } from "typescript-ioc/es6";
import { IMSCUser } from "../security/MSCSecurity";
import TermsRecord from "../../db/models/TermsRecord";
import TermsTextRecord from "../../db/models/TermsTextRecord";

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

export const VERSION_DRAFT = "draft";

/**
 * API controller for terms of service management
 */
@AutoWired
export default class TermsController {
    constructor() {
    }

    public async doesUserNeedToSignTerms(user: IMSCUser): Promise<boolean> {
        return Object.keys((await this.getMissingTermsForUser(user)).policies).length > 0;
    }

    public async getMissingTermsForUser(_user: IMSCUser): Promise<ITermsNotSignedResponse> {
        // TODO: Abuse a cache for non-draft policies
        return {policies: {}};
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