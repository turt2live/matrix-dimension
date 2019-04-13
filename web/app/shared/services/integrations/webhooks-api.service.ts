import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_Webhook, FE_WebhookOptions } from "../../models/webhooks";
import { map } from "rxjs/operators";

@Injectable()
export class WebhooksApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public createWebhook(roomId: string, options: FE_WebhookOptions): Promise<FE_Webhook> {
        return this.authedPost("/api/v1/dimension/webhooks/room/" + roomId + "/webhooks/new", options)
            .pipe(map(r => r.json())).toPromise();
    }

    public updateWebhook(roomId: string, hookId: string, options: FE_WebhookOptions): Promise<FE_Webhook> {
        return this.authedPost("/api/v1/dimension/webhooks/room/" + roomId + "/webhooks/" + hookId, options)
            .pipe(map(r => r.json())).toPromise();
    }

    public deleteWebhook(roomId: string, hookId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/webhooks/room/" + roomId + "/webhooks/" + hookId)
            .pipe(map(r => r.json())).toPromise();
    }
}