import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../AuthedApi";
import { FE_DimensionConfig, FE_DimensionVersion } from "../../models/admin_responses";

@Injectable()
export class AdminApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public isAdmin(): Promise<any> {
        return this.authedGet("/api/v1/dimension/admin/check").map(r => r.json()).toPromise();
    }

    public getConfig(): Promise<FE_DimensionConfig> {
        return this.authedGet("/api/v1/dimension/admin/config").map(r => r.json()).toPromise();
    }

    public getVersion(): Promise<FE_DimensionVersion> {
        return this.authedGet("/api/v1/dimension/admin/version").map(r => r.json()).toPromise();
    }
}
