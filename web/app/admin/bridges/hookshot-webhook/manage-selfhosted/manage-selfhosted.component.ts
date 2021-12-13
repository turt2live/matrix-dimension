import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { TranslateService } from "@ngx-translate/core";
import { AdminHookshotWebhookApiService } from "../../../../shared/services/admin/admin-hookshot-webhook-api.service";

export interface ManageSelfhostedHookshotWebhookBridgeDialogContext {
    provisionUrl: string;
    sharedSecret: string;
    bridgeId: number;
    isAdding: boolean;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminHookshotWebhookBridgeManageSelfhostedComponent {

    isSaving = false;
    provisionUrl: string;
    sharedSecret: string;
    bridgeId: number;
    isAdding = true;

    constructor(public modal: NgbActiveModal,
        private hookshotApi: AdminHookshotWebhookApiService,
        private toaster: ToasterService,
        public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.hookshotApi.newSelfhosted(this.provisionUrl, this.sharedSecret).then(() => {
                this.translate.get('Webhook bridge added').subscribe((res: string) => {
                    this.toaster.pop("success", res);
                });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Webhook bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        } else {
            this.hookshotApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret).then(() => {
                this.translate.get('Webhook bridge updated').subscribe((res: string) => {
                    this.toaster.pop("success", res);
                });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Webhook bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        }
    }
}
