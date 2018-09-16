import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminTelegramApiService } from "../../../../shared/services/admin/admin-telegram-api.service";

export class ManageSelfhostedTelegramBridgeDialogContext extends BSModalContext {
    public provisionUrl: string;
    public sharedSecret: string;
    public allowPuppets = false;
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
    public allowPuppets = false;
    public bridgeId: number;
    public isAdding = false;

    constructor(public dialog: DialogRef<ManageSelfhostedTelegramBridgeDialogContext>,
                private telegramApi: AdminTelegramApiService,
                private toaster: ToasterService) {
        this.provisionUrl = dialog.context.provisionUrl;
        this.sharedSecret = dialog.context.sharedSecret;
        this.allowPuppets = dialog.context.allowPuppets;
        this.bridgeId = dialog.context.bridgeId;
        this.isAdding = !this.bridgeId;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.telegramApi.newSelfhosted(this.provisionUrl, this.sharedSecret, this.allowPuppets).then(() => {
                this.toaster.pop("success", "Telegram bridge added");
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.toaster.pop("error", "Failed to create Telegram bridge");
            });
        } else {
            this.telegramApi.updateSelfhosted(this.bridgeId, this.provisionUrl, this.sharedSecret, this.allowPuppets).then(() => {
                this.toaster.pop("success", "Telegram bridge updated");
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.toaster.pop("error", "Failed to update Telegram bridge");
            });
        }
    }
}
