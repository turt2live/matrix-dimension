import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "./AuthedApi";

@Injectable()
export class AdminApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }
}
