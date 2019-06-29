import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminUpstreamApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getUpstreams(): Promise<FE_Upstream[]> {
        return this.authedGet<FE_Upstream[]>("/api/v1/dimension/admin/upstreams/all").toPromise();
    }

    public newUpstream(name: string, type: string, scalarUrl: string, apiUrl: string): Promise<FE_Upstream> {
        return this.authedPost<FE_Upstream>("/api/v1/dimension/admin/upstreams/new", {
            name: name,
            type: type,
            scalarUrl: scalarUrl,
            apiUrl: apiUrl,
        }).toPromise();
    }
}
