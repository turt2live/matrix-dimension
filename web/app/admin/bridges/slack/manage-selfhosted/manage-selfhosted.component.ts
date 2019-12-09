import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminSlackApiService } from "../../../../shared/services/admin/admin-slack-api.service";

export class ManageSelfhostedSlackBridgeDialogContext extends BSModalContext {
    public provisionUrl: string;
    public bridgeId: number;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminSlackBridgeManageSelfhostedComponent implements ModalComponent<ManageSelfhostedSlackBridgeDialogContext> {

    public isSaving = false;
    public provisionUrl: string;
    public bridgeId: number;
    public isAdding = false;

    constructor(public dialog: DialogRef<ManageSelfhostedSlackBridgeDialogContext>,
                private slackApi: AdminSlackApiService,
                private toaster: ToasterService) {
        this.provisionUrl = dialog.context.provisionUrl;
        this.bridgeId = dialog.context.bridgeId;
        this.isAdding = !this.bridgeId;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.slackApi.newSelfhosted(this.provisionUrl).then(() => {
                this.toaster.pop("success", "Slack bridge added");
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.toaster.pop("error", "Failed to create Slack bridge");
            });
        } else {
            this.slackApi.updateSelfhosted(this.bridgeId, this.provisionUrl).then(() => {
                this.toaster.pop("success", "Slack bridge updated");
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.toaster.pop("error", "Failed to update Slack bridge");
            });
        }
    }
}
