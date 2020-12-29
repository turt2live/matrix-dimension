import { Component } from "@angular/core";
import { FE_SimpleBot } from "../../shared/models/integration";
import { ToasterService } from "angular2-toaster";
import { ScalarClientApiService } from "../../shared/services/scalar/scalar-client-api.service";
import { IntegrationsApiService } from "../../shared/services/integrations/integrations-api.service";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { DialogRef } from "ngx-modialog";
import { TranslateService } from "@ngx-translate/core";

export class SimpleBotConfigDialogContext extends BSModalContext {
    public bot: FE_SimpleBot;
    public roomId: string;
}

@Component({
    templateUrl: "simple-bot.component.html",
    styleUrls: ["simple-bot.component.scss"],
})
export class ConfigSimpleBotComponent {

    public bot: FE_SimpleBot;

    private roomId: string;

    constructor(public dialog: DialogRef<SimpleBotConfigDialogContext>,
                private toaster: ToasterService,
                private scalar: ScalarClientApiService,
                private integrationsApi: IntegrationsApiService,
                public translate: TranslateService) {
        this.translate = translate;
        this.bot = dialog.context.bot;
        this.roomId = dialog.context.roomId;

        this.bot._isUpdating = false;
    }

    public toggle() {
        let promise: Promise<any> = Promise.resolve();
        if (!this.bot._inRoom) {
            promise = this.scalar.inviteUser(this.roomId, this.bot.userId);
        } else promise = this.integrationsApi.removeIntegration(this.bot.category, this.bot.type, this.roomId);

        this.bot._inRoom = !this.bot._inRoom;
        this.bot._isUpdating = true;
        promise.then(() => {
            this.bot._isUpdating = false;
            if (this.bot._inRoom) {
                this.translate.get('was invited to the room').subscribe((res: string) => {this.toaster.pop("success", this.bot.displayName + res); });
            } else {
                this.translate.get('was removed from the room').subscribe((res: string) => {this.toaster.pop("success", this.bot.displayName + res); });
            }
        }).catch(err => {
            this.bot._inRoom = !this.bot._inRoom; // revert the status change
            this.bot._isUpdating = false;
            console.error(err);

            let errorMessage = null;
            if (err.json) errorMessage = err.json().error;
            if (err.response && err.response.error) errorMessage = err.response.error.message;
            if (!errorMessage) errorMessage = "";
            this.translate.get('Could not update integration status').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
