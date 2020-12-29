import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminTelegramApiService } from "../../../../shared/services/admin/admin-telegram-api.service";
import { TranslateService } from "@ngx-translate/core";

export class ManageSelfhostedTelegramBridgeDialogContext extends BSModalContext {
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
export class AdminTelegramBridgeManageSelfhostedComponent implements ModalComponent<ManageSelfhostedTelegramBridgeDialogContext> {

    public isSaving = false;
    public provisionUrl: string;
    public sharedSecret: string;
    public allowTgPuppets = false;
    public allowMxPuppets = false;
    public bridgeId: number;
    public isAdding = false;

    constructor(public dialog: DialogRef<ManageSelfhostedTelegramBridgeDialogContext>,
                private telegramApi: AdminTelegramApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
        this.provisionUrl = dialog.context.provisionUrl;
        this.sharedSecret = dialog.context.sharedSecret;
        this.allowTgPuppets = dialog.context.allowTgPuppets;
        this.allowMxPuppets = dialog.context.allowMxPuppets;
        this.bridgeId = dialog.context.bridgeId;
        this.isAdding = !this.bridgeId;
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
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Telegram bridge').subscribe((res: string) => { this.toaster.pop("error", res); });
            });
        } else {
            this.telegramApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret, options).then(() => {
                this.translate.get('Telegram bridge updated').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Telegram bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        }
    }
}
