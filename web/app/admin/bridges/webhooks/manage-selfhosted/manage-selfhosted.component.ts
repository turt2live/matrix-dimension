import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { AdminWebhooksApiService } from "../../../../shared/services/admin/admin-webhooks-api.service";
import { TranslateService } from "@ngx-translate/core";

export interface ManageSelfhostedWebhooksBridgeDialogContext {
    provisionUrl: string;
    sharedSecret: string;
    allowTgPuppets: boolean;
    allowMxPuppets: boolean;
    bridgeId: number;
    isAdding: boolean;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminWebhooksBridgeManageSelfhostedComponent {

    public isSaving = false;
    public provisionUrl: '';
    public sharedSecret: '';
    public allowTgPuppets = false;
    public allowMxPuppets = false;
    public bridgeId: number;
    public isAdding = true;

    constructor(public modal: NgbActiveModal,
        private webhooksApi: AdminWebhooksApiService,
        private toaster: ToasterService,
        public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.webhooksApi.newSelfhosted(this.provisionUrl, this.sharedSecret).then(() => {
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
            this.webhooksApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret).then(() => {
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
