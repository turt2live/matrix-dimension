import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminWebhooksApiService } from "../../../../shared/services/admin/admin-webhooks-api.service";

export class ManageSelfhostedWebhooksBridgeDialogContext extends BSModalContext {
    public provisionUrl: string;
    public sharedSecret: string;
    public allowTgPuppets = false;
    public allowMxPuppets = false;
    public bridgeId: number;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminWebhooksBridgeManageSelfhostedComponent implements ModalComponent<ManageSelfhostedWebhooksBridgeDialogContext> {

    public isSaving = false;
    public provisionUrl: string;
    public sharedSecret: string;
    public bridgeId: number;
    public isAdding = false;

    constructor(public dialog: DialogRef<ManageSelfhostedWebhooksBridgeDialogContext>,
                private webhooksApi: AdminWebhooksApiService,
                private toaster: ToasterService) {
        this.provisionUrl = dialog.context.provisionUrl;
        this.sharedSecret = dialog.context.sharedSecret;
        this.bridgeId = dialog.context.bridgeId;
        this.isAdding = !this.bridgeId;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.webhooksApi.newSelfhosted(this.provisionUrl, this.sharedSecret).then(() => {
                this.toaster.pop("success", "Webhook bridge added");
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.toaster.pop("error", "Failed to create Webhook bridge");
            });
        } else {
            this.webhooksApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret).then(() => {
                this.toaster.pop("success", "Webhook bridge updated");
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.toaster.pop("error", "Failed to update Webhook bridge");
            });
        }
    }
}
