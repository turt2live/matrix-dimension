import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_GitterBridge } from "../../models/gitter";
import { map } from "rxjs/operators";

@Injectable()
export class AdminGitterApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBridges(): Promise<FE_GitterBridge[]> {
        return this.authedGet("/api/v1/dimension/admin/gitter/all")
            .pipe(map(r => r.json())).toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_GitterBridge> {
        return this.authedGet("/api/v1/dimension/admin/gitter/" + bridgeId)
            .pipe(map(r => r.json())).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_GitterBridge> {
        return this.authedPost("/api/v1/dimension/admin/gitter/new/upstream", {upstreamId: upstream.id})
            .pipe(map(r => r.json())).toPromise();
    }

    public newSelfhosted(provisionUrl: string): Promise<FE_GitterBridge> {
        return this.authedPost("/api/v1/dimension/admin/gitter/new/selfhosted", {
            provisionUrl: provisionUrl,
        }).pipe(map(r => r.json())).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string): Promise<FE_GitterBridge> {
        return this.authedPost("/api/v1/dimension/admin/gitter/" + bridgeId, {
            provisionUrl: provisionUrl,
        }).pipe(map(r => r.json())).toPromise();
    }
}
