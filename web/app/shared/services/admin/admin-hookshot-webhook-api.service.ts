import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotWebhookBridge } from "../../models/hookshot_webhook";

@Injectable()
export class AdminHookshotWebhookApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBridges(): Promise<FE_HookshotWebhookBridge[]> {
        return this.authedGet<FE_HookshotWebhookBridge[]>("/api/v1/dimension/admin/hookshot/webhook/all").toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_HookshotWebhookBridge> {
        return this.authedGet<FE_HookshotWebhookBridge>("/api/v1/dimension/admin/hookshot/webhook/" + bridgeId).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_HookshotWebhookBridge> {
        return this.authedPost<FE_HookshotWebhookBridge>("/api/v1/dimension/admin/hookshot/webhook/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newSelfhosted(provisionUrl: string, sharedSecret: string): Promise<FE_HookshotWebhookBridge> {
        return this.authedPost<FE_HookshotWebhookBridge>("/api/v1/dimension/admin/hookshot/webhook/new/selfhosted", {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string, sharedSecret: string): Promise<FE_HookshotWebhookBridge> {
        return this.authedPost<FE_HookshotWebhookBridge>("/api/v1/dimension/admin/hookshot/webhook/" + bridgeId, {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }
}
