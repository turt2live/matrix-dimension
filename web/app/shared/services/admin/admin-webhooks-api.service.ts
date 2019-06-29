import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_WebhooksBridge } from "../../models/webhooks";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminWebhooksApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBridges(): Promise<FE_WebhooksBridge[]> {
        return this.authedGet<FE_WebhooksBridge[]>("/api/v1/dimension/admin/webhooks/all").toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_WebhooksBridge> {
        return this.authedGet<FE_WebhooksBridge>("/api/v1/dimension/admin/webhooks/" + bridgeId).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_WebhooksBridge> {
        return this.authedPost<FE_WebhooksBridge>("/api/v1/dimension/admin/webhooks/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newSelfhosted(provisionUrl: string, sharedSecret: string): Promise<FE_WebhooksBridge> {
        return this.authedPost<FE_WebhooksBridge>("/api/v1/dimension/admin/webhooks/new/selfhosted", {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string, sharedSecret: string): Promise<FE_WebhooksBridge> {
        return this.authedPost<FE_WebhooksBridge>("/api/v1/dimension/admin/webhooks/" + bridgeId, {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }
}
