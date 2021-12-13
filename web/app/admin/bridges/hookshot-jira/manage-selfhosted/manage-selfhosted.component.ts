import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { TranslateService } from "@ngx-translate/core";
import { AdminHookshotJiraApiService } from "../../../../shared/services/admin/admin-hookshot-jira-api.service";

export interface ManageSelfhostedHookshotJiraBridgeDialogContext {
    provisionUrl: string;
    sharedSecret: string;
    bridgeId: number;
    isAdding: boolean;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminHookshotJiraBridgeManageSelfhostedComponent {

    isSaving = false;
    provisionUrl: string;
    sharedSecret: string;
    bridgeId: number;
    isAdding = true;

    constructor(public modal: NgbActiveModal,
        private hookshotApi: AdminHookshotJiraApiService,
        private toaster: ToasterService,
        public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.hookshotApi.newSelfhosted(this.provisionUrl, this.sharedSecret).then(() => {
                this.translate.get('Jira bridge added').subscribe((res: string) => {
                    this.toaster.pop("success", res);
                });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Jira bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        } else {
            this.hookshotApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret).then(() => {
                this.translate.get('Jira bridge updated').subscribe((res: string) => {
                    this.toaster.pop("success", res);
                });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Jira bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        }
    }
}
