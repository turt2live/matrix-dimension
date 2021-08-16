import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { AdminTelegramApiService } from "../../../../shared/services/admin/admin-telegram-api.service";
import { TranslateService } from "@ngx-translate/core";

export interface ManageSelfhostedTelegramBridgeDialogContext {
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
export class AdminTelegramBridgeManageSelfhostedComponent {

    isSaving = false;
    provisionUrl: string;
    sharedSecret: string;
    allowTgPuppets = false;
    allowMxPuppets = false;
    bridgeId: number;
    isAdding = true;

    constructor(public modal: NgbActiveModal,
                private telegramApi: AdminTelegramApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        const options = {
            allowTgPuppets: this.allowTgPuppets,
            allowMxPuppets: this.allowMxPuppets,
        };
        if (this.isAdding) {
            this.telegramApi.newSelfhosted(this.provisionUrl, this.sharedSecret, options).then(() => {
                this.translate.get('Telegram bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Telegram bridge').subscribe((res: string) => { this.toaster.pop("error", res); });
            });
        } else {
            this.telegramApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret, options).then(() => {
                this.translate.get('Telegram bridge updated').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.modal.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Telegram bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        }
    }
}
