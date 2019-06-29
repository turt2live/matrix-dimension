import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_DimensionConfig, FE_DimensionVersion } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public isAdmin(): Promise<any> {
        return this.authedGet("/api/v1/dimension/admin/check").toPromise();
    }

    public getConfig(): Promise<FE_DimensionConfig> {
        return this.authedGet<FE_DimensionConfig>("/api/v1/dimension/admin/config").toPromise();
    }

    public getVersion(): Promise<FE_DimensionVersion> {
        return this.authedGet<FE_DimensionVersion>("/api/v1/dimension/admin/version").toPromise();
    }

    public logoutAll(): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/sessions/logout/all").toPromise();
    }
}
