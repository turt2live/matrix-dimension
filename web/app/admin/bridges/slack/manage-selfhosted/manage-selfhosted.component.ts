import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { AdminSlackApiService } from "../../../../shared/services/admin/admin-slack-api.service";
import { TranslateService } from "@ngx-translate/core";

export interface ManageSelfhostedSlackBridgeDialogContext {
    provisionUrl: string;
    bridgeId: number;
    isAdding: boolean;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminSlackBridgeManageSelfhostedComponent {

    public isSaving = false;
    public provisionUrl: string;
    public bridgeId: number;
    public isAdding = true;

    constructor(public modal: NgbActiveModal,
                private slackApi: AdminSlackApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.slackApi.newSelfhosted(this.provisionUrl).then(() => {
                this.translate.get('Slack bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Slack bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        } else {
            this.slackApi.updateSelfhosted(this.bridgeId, this.provisionUrl).then(() => {
                this.translate.get('Slack bridge updated').subscribe((res: string) => this.toaster.pop("success", res));
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Slack bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        }
    }
}
