import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_WebhooksBridge } from "../../models/webhooks";
import { map } from "rxjs/operators";

@Injectable()
export class AdminWebhooksApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBridges(): Promise<FE_WebhooksBridge[]> {
        return this.authedGet("/api/v1/dimension/admin/webhooks/all")
            .pipe(map(r => r.json())).toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_WebhooksBridge> {
        return this.authedGet("/api/v1/dimension/admin/webhooks/" + bridgeId)
            .pipe(map(r => r.json())).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_WebhooksBridge> {
        return this.authedPost("/api/v1/dimension/admin/webhooks/new/upstream", {upstreamId: upstream.id})
            .pipe(map(r => r.json())).toPromise();
    }

    public newSelfhosted(provisionUrl: string, sharedSecret: string): Promise<FE_WebhooksBridge> {
        return this.authedPost("/api/v1/dimension/admin/webhooks/new/selfhosted", {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).pipe(map(r => r.json())).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string, sharedSecret: string): Promise<FE_WebhooksBridge> {
        return this.authedPost("/api/v1/dimension/admin/webhooks/" + bridgeId, {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).pipe(map(r => r.json())).toPromise();
    }
}
