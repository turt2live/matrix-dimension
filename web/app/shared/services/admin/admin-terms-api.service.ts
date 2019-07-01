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
}
