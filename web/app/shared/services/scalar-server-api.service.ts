import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { ScalarAccountResponse } from "../models/scalar_server_responses";
import { AuthedApi } from "./AuthedApi";

@Injectable()
export class ScalarServerApiService extends AuthedApi {
    constructor(http: Http) {
        super(http)
    }

    public getAccount(): Promise<ScalarAccountResponse> {
        return this.authedGet("/api/v1/scalar/account").map(res => res.json()).toPromise();
    }
}
