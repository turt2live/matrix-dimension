import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Webhook, FE_WebhookOptions } from "../../models/webhooks";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class WebhooksApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public createWebhook(roomId: string, options: FE_WebhookOptions): Promise<FE_Webhook> {
        return this.authedPost<FE_Webhook>("/api/v1/dimension/webhooks/room/" + roomId + "/webhooks/new", options).toPromise();
    }

    public updateWebhook(roomId: string, hookId: string, options: FE_WebhookOptions): Promise<FE_Webhook> {
        return this.authedPost<FE_Webhook>("/api/v1/dimension/webhooks/room/" + roomId + "/webhooks/" + hookId, options).toPromise();
    }

    public deleteWebhook(roomId: string, hookId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/webhooks/room/" + roomId + "/webhooks/" + hookId).toPromise();
    }
}