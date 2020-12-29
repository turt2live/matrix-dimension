import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminSlackApiService } from "../../../../shared/services/admin/admin-slack-api.service";
import { TranslateService } from "@ngx-translate/core";

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
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
        this.provisionUrl = dialog.context.provisionUrl;
        this.bridgeId = dialog.context.bridgeId;
        this.isAdding = !this.bridgeId;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.slackApi.newSelfhosted(this.provisionUrl).then(() => {
                this.translate.get('Slack bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Slack bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        } else {
            this.slackApi.updateSelfhosted(this.bridgeId, this.provisionUrl).then(() => {
                this.translate.get('Slack bridge updated').subscribe((res: string) => this.toaster.pop("success", res));
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Slack bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        }
    }
}
