import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_DimensionConfig, FE_DimensionVersion } from "../../models/admin-responses";
import { map } from "rxjs/operators";

@Injectable()
export class AdminApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public isAdmin(): Promise<any> {
        return this.authedGet("/api/v1/dimension/admin/check")
            .pipe(map(r => r.json())).toPromise();
    }

    public getConfig(): Promise<FE_DimensionConfig> {
        return this.authedGet("/api/v1/dimension/admin/config")
            .pipe(map(r => r.json())).toPromise();
    }

    public getVersion(): Promise<FE_DimensionVersion> {
        return this.authedGet("/api/v1/dimension/admin/version")
            .pipe(map(r => r.json())).toPromise();
    }

    public logoutAll(): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/sessions/logout/all")
            .pipe(map(r => r.json())).toPromise();
    }
}
