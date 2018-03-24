import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { FE_ScalarAccountResponse } from "../../models/scalar-server-responses";
import { AuthedApi } from "../authed-api";

@Injectable()
export class ScalarServerApiService extends AuthedApi {
    constructor(http: Http) {
        super(http)
    }

    public getAccount(): Promise<FE_ScalarAccountResponse> {
        return this.authedGet("/api/v1/scalar/account").map(res => res.json()).toPromise();
    }
}
