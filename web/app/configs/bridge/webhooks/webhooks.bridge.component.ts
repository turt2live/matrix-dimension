import { Component } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { FE_Webhook } from "../../../shared/models/webhooks";
import { WebhooksApiService } from "../../../shared/services/integrations/webhooks-api.service";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";

interface WebhooksConfig {
    webhooks: FE_Webhook[];
    botUserId: string;
}

@Component({
    templateUrl: "webhooks.bridge.component.html",
    styleUrls: ["webhooks.bridge.component.scss"],
})
export class WebhooksBridgeConfigComponent extends BridgeComponent<WebhooksConfig> {

    public webhookName: string;
    public isBusy = false;

    constructor(private webhooks: WebhooksApiService, private scalar: ScalarClientApiService) {
        super("webhooks");
    }

    public async newHook() {
        this.isBusy = true;

        try {
            await this.scalar.inviteUser(this.roomId, this.newConfig.botUserId);
        } catch (e) {
            if (!e.response || !e.response.error || !e.response.error._error ||
                e.response.error._error.message.indexOf("already in the room") === -1) {
                this.isBusy = false;
                this.toaster.pop("error", "Error inviting bridge");
                return;
            }
        }

        this.webhooks.createWebhook(this.roomId, {label: this.webhookName}).then(hook => {
            this.newConfig.webhooks.push(hook);
            this.isBusy = false;
            this.webhookName = "";
            this.toaster.pop("success", "Webhook created");
        }).catch(err => {
            console.error(err);
            this.isBusy = false;
            this.toaster.pop("error", "Error creating webhook");
        });
    }

    public removeHook(hook: FE_Webhook) {
        this.isBusy = true;
        this.webhooks.deleteWebhook(this.roomId, hook.id).then(() => {
            const idx = this.newConfig.webhooks.indexOf(hook);
            if (idx !== -1) this.newConfig.webhooks.splice(idx, 1);
            this.isBusy = false;
            this.toaster.pop("success", "Webhook deleted");
        }).catch(err => {
            console.error(err);
            this.isBusy = false;
            this.toaster.pop("error", "Error deleting webhook");
        });
    }
}