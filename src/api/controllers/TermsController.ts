import { AutoWired } from "typescript-ioc/es6";
import { IMSCUser } from "../security/MSCSecurity";

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
        return {policies: {}};
    }
}