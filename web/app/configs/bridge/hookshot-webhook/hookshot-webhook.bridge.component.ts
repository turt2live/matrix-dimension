import { Component } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { FE_Webhook } from "../../../shared/models/webhooks";
import { WebhooksApiService } from "../../../shared/services/integrations/webhooks-api.service";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";
import { TranslateService } from "@ngx-translate/core";
import { FE_HookshotJiraConnection } from "../../../shared/models/hookshot_jira";
import { FE_HookshotWebhookConnection } from "../../../shared/models/hookshot_webhook";
import { HookshotWebhookApiService } from "../../../shared/services/integrations/hookshot-webhook-api.service";

interface HookshotConfig {
    botUserId: string;
    connections: FE_HookshotWebhookConnection[];
}

@Component({
    templateUrl: "hookshot-webhook.bridge.component.html",
    styleUrls: ["hookshot-webhook.bridge.component.scss"],
})
export class HookshotWebhookBridgeConfigComponent extends BridgeComponent<HookshotConfig> {

    public webhookName: string;
    public isBusy = false;

    constructor(private webhooks: HookshotWebhookApiService, private scalar: ScalarClientApiService, public translate: TranslateService) {
        super("hookshot_webhook", translate);
    }

    public async newHook() {
        this.isBusy = true;

        try {
            await this.scalar.inviteUser(this.roomId, this.newConfig.botUserId);
        } catch (e) {
            if (!e.response || !e.response.error || !e.response.error._error ||
                e.response.error._error.message.indexOf("already in the room") === -1) {
                this.isBusy = false;
                this.translate.get('Error inviting bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
                return;
            }
        }

        this.webhooks.createWebhook(this.roomId, this.webhookName).then(hook => {
            this.newConfig.connections.push(hook);
            this.isBusy = false;
            this.webhookName = "";
            this.translate.get('Webhook created').subscribe((res: string) => {
                this.toaster.pop("success", res);
            });
        }).catch(err => {
            console.error(err);
            this.isBusy = false;
            this.translate.get('Error creating webhook').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }

    public removeHook(hook: FE_HookshotWebhookConnection) {
        this.isBusy = true;
        this.webhooks.deleteWebhook(this.roomId, hook.id).then(() => {
            const idx = this.newConfig.connections.indexOf(hook);
            if (idx !== -1) this.newConfig.connections.splice(idx, 1);
            this.isBusy = false;
            this.translate.get('Webhook deleted').subscribe((res: string) => {
                this.toaster.pop("success", res);
            });
        }).catch(err => {
            console.error(err);
            this.isBusy = false;
            this.translate.get('Error deleting webhook').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }
}
