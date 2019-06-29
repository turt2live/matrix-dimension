import { Injectable } from "@angular/core";
import {
    FE_ScalarAccountResponse,
    FE_ScalarOpenIdRequestBody,
    FE_ScalarRegisterResponse
} from "../../models/scalar-server-responses";
import { AuthedApi } from "../authed-api";
import { SCALAR_API_VERSION } from "../../../../../src/utils/common-constants";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ScalarServerApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http)
    }

    public ping(): Promise<any> {
        return this.http.get("/api/v1/scalar/ping").toPromise();
    }

    public getAccount(): Promise<FE_ScalarAccountResponse> {
        return this.authedGet<FE_ScalarAccountResponse>("/api/v1/scalar/account", {v: SCALAR_API_VERSION}).toPromise();
    }

    public register(openId: FE_ScalarOpenIdRequestBody): Promise<FE_ScalarRegisterResponse> {
        return this.http.post<FE_ScalarRegisterResponse>("/api/v1/scalar/register", openId, {
            params: {v: SCALAR_API_VERSION},
        }).toPromise();
    }
}
