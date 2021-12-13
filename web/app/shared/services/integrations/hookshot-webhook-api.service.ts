import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotWebhookConnection } from "../../models/hookshot_webhook";

@Injectable()
export class HookshotWebhookApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public createWebhook(roomId: string, name: string): Promise<FE_HookshotWebhookConnection> {
        return this.authedPost<FE_HookshotWebhookConnection>("/api/v1/dimension/hookshot/webhook/room/" + roomId + "/connect", {
            name,
        }).toPromise();
    }

    public deleteWebhook(roomId: string, webhookId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/hookshot/webhook/room/" + roomId + "/connection/" + encodeURIComponent(webhookId) + "/disconnect").toPromise();
    }

}
