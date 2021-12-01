import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { AdminTelegramApiService } from "../../../../shared/services/admin/admin-telegram-api.service";
import { TranslateService } from "@ngx-translate/core";
import { AdminHookshotGithubApiService } from "../../../../shared/services/admin/admin-hookshot-github-api.service";

export interface ManageSelfhostedHookshotGithubBridgeDialogContext {
    provisionUrl: string;
    sharedSecret: string;
    bridgeId: number;
    isAdding: boolean;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminHookshotGithubBridgeManageSelfhostedComponent {

    isSaving = false;
    provisionUrl: string;
    sharedSecret: string;
    bridgeId: number;
    isAdding = true;

    constructor(public modal: NgbActiveModal,
        private hookshotApi: AdminHookshotGithubApiService,
        private toaster: ToasterService,
        public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.hookshotApi.newSelfhosted(this.provisionUrl, this.sharedSecret).then(() => {
                this.translate.get('Github bridge added').subscribe((res: string) => {
                    this.toaster.pop("success", res);
                });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Github bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        } else {
            this.hookshotApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret).then(() => {
                this.translate.get('Github bridge updated').subscribe((res: string) => {
                    this.toaster.pop("success", res);
                });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Github bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        }
    }
}
