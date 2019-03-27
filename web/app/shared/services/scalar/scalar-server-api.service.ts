import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import {
    FE_ScalarAccountResponse,
    FE_ScalarOpenIdRequestBody,
    FE_ScalarRegisterResponse
} from "../../models/scalar-server-responses";
import { AuthedApi } from "../authed-api";
import { SCALAR_API_VERSION } from "../../../../../src/utils/common-constants";

@Injectable()
export class ScalarServerApiService extends AuthedApi {
    constructor(http: Http) {
        super(http)
    }

    public ping(): Promise<any> {
        return this.http.get("/api/v1/scalar/ping").map(res => res.json()).toPromise();
    }

    public getAccount(): Promise<FE_ScalarAccountResponse> {
        return this.authedGet("/api/v1/scalar/account", {v: SCALAR_API_VERSION}).map(res => res.json()).toPromise();
    }

    public register(openId: FE_ScalarOpenIdRequestBody): Promise<FE_ScalarRegisterResponse> {
        return this.http.post("/api/v1/scalar/register", openId, {
            params: {v: SCALAR_API_VERSION},
        }).map(res => res.json()).toPromise();
    }
}
