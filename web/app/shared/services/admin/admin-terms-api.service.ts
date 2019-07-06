import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import { FE_TermsEditable } from "../../models/terms";

@Injectable()
export class AdminTermsApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http, true);
    }

    public getAllPolicies(): Promise<FE_TermsEditable[]> {
        return this.authedGet<FE_TermsEditable[]>("/api/v1/dimension/admin/terms/all").toPromise();
    }

    public createDraft(shortcode: string, policyInfo: { name: string, text: string, url: string }): Promise<FE_TermsEditable> {
        return this.authedPost<FE_TermsEditable>(`/api/v1/dimension/admin/terms/${shortcode}/draft`, policyInfo).toPromise();
    }

    public getDraft(shortcode: string): Promise<FE_TermsEditable> {
        return this.authedGet<FE_TermsEditable>(`/api/v1/dimension/admin/terms/${shortcode}/draft`).toPromise();
    }

    public updateDraft(shortcode: string, policyInfo: { name: string, text: string, url: string }): Promise<FE_TermsEditable> {
        return this.authedPut<FE_TermsEditable>(`/api/v1/dimension/admin/terms/${shortcode}/draft`, policyInfo).toPromise();
    }

    public publishDraft(shortcode: string, newVersion: string): Promise<FE_TermsEditable> {
        return this.authedPost<FE_TermsEditable>(`/api/v1/dimension/admin/terms/${shortcode}/publish/${newVersion}`).toPromise();
    }
}
