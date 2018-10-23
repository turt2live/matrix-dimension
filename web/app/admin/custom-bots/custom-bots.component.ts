import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { FE_CustomSimpleBot } from "../../shared/models/admin-responses";
import { AdminCustomSimpleBotsApiService } from "../../shared/services/admin/admin-custom-simple-bots-api.service";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { AddCustomBotDialogContext, AdminAddCustomBotComponent } from "./add/add.component";

@Component({
    templateUrl: "./custom-bots.component.html",
    styleUrls: ["./custom-bots.component.scss"],
})
export class AdminCustomBotsComponent {

    public isLoading = true;
    public bots: FE_CustomSimpleBot[];
    public isUpdating = false;

    constructor(private botApi: AdminCustomSimpleBotsApiService,
                private toaster: ToasterService,
                private modal: Modal) {

        this.reload().then(() => this.isLoading = false).catch(error => {
            console.error(error);
            this.toaster.pop("error", "Error loading go-neb configuration");
        });
    }

    private reload(): Promise<any> {
        return this.botApi.getBots().then(bots => {
            this.bots = bots;
            this.isLoading = false;
        });
    }

    public addBot() {
        this.modal.open(AdminAddCustomBotComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',
        }, AddCustomBotDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.toaster.pop("error", "Failed to get an updated bot list");
            });
        });
    }

    public editBot(bot: FE_CustomSimpleBot) {
        this.modal.open(AdminAddCustomBotComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            bot: bot,
        }, AddCustomBotDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.toaster.pop("error", "Failed to get an updated bot list");
            });
        });
    }

    public toggleBot(bot: FE_CustomSimpleBot) {
        this.isUpdating = true;
        bot.isEnabled = !bot.isEnabled;
        this.botApi.updateBot(bot.id, bot).then(() => {
            this.isUpdating = false;
            this.toaster.pop("success", "Bot " + (bot.isEnabled ? "enabled" : "disabled"));
        }).catch(error => {
            console.error(error);
            bot.isEnabled = !bot.isEnabled;
            this.toaster.pop("error", "Error updating bot");
        })
    }
}
