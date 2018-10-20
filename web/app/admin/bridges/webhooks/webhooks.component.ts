import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import {
    AdminWebhooksBridgeManageSelfhostedComponent,
    ManageSelfhostedWebhooksBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { FE_WebhooksBridge } from "../../../shared/models/webhooks";
import { AdminWebhooksApiService } from "../../../shared/services/admin/admin-webhooks-api.service";

@Component({
    templateUrl: "./webhooks.component.html",
    styleUrls: ["./webhooks.component.scss"],
})
export class AdminWebhooksBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_WebhooksBridge[] = [];

    constructor(private webhooksApi: AdminWebhooksApiService,
                private toaster: ToasterService,
                private modal: Modal) {
    }

    public ngOnInit() {
        this.reload().then(() => this.isLoading = false);
    }

    private async reload(): Promise<any> {
        try {
            this.configurations = await this.webhooksApi.getBridges();
        } catch (err) {
            console.error(err);
            this.toaster.pop("error", "Error loading bridges");
        }
    }

    public addSelfHostedBridge() {
        this.modal.open(AdminWebhooksBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: '',
            sharedSecret: '',
            allowPuppets: false,
        }, ManageSelfhostedWebhooksBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.toaster.pop("error", "Failed to get an update Webhooks bridge list");
            });
        });
    }

    public editBridge(bridge: FE_WebhooksBridge) {
        this.modal.open(AdminWebhooksBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: bridge.provisionUrl,
            sharedSecret: bridge.sharedSecret,
            bridgeId: bridge.id,
        }, ManageSelfhostedWebhooksBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.toaster.pop("error", "Failed to get an update Webhooks bridge list");
            });
        });
    }
}
