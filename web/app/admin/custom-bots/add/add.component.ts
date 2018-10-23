import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { FE_CustomSimpleBot, FE_UserProfile } from "../../../shared/models/admin-responses";
import { AdminCustomSimpleBotsApiService } from "../../../shared/services/admin/admin-custom-simple-bots-api.service";

export class AddCustomBotDialogContext extends BSModalContext {
    bot: FE_CustomSimpleBot;
}

@Component({
    templateUrl: "./add.component.html",
    styleUrls: ["./add.component.scss"],
})
export class AdminAddCustomBotComponent implements ModalComponent<AddCustomBotDialogContext> {

    public bot: FE_CustomSimpleBot;
    public isAdding = false;
    public isSaving = false;

    private lastProfile: FE_UserProfile;

    constructor(public dialog: DialogRef<AddCustomBotDialogContext>,
                private botApi: AdminCustomSimpleBotsApiService,
                private toaster: ToasterService) {
        this.bot = this.dialog.context.bot || <FE_CustomSimpleBot>{};
        this.isAdding = !this.dialog.context.bot;
    }

    public loadProfile() {
        this.botApi.getProfile(this.bot.userId).then(profile => {
            if (!this.lastProfile || this.lastProfile.name === this.bot.name) {
                this.bot.name = profile.name;
            }
            if (!this.lastProfile || this.lastProfile.avatarUrl === this.bot.avatarUrl) {
                this.bot.avatarUrl = profile.avatarUrl;
            }
            this.lastProfile = profile;
        }).catch(error => {
            console.error(error);
            // We don't need to alert the user - this is non-fatal
        });
    }

    public add() {
        if (!this.bot.name) {
            this.toaster.pop("warning", "Please enter a name for the bot");
            return;
        }
        if (!this.bot.avatarUrl) {
            this.toaster.pop("warning", "Please enter an avatar URL for the bot");
            return;
        }
        if (!this.bot.userId) {
            this.toaster.pop("warning", "Please enter a user ID for the bot");
            return;
        }
        if (!this.bot.description) {
            this.toaster.pop("warning", "Please enter a description for the bot");
            return;
        }
        if (!this.bot.accessToken) {
            this.toaster.pop("warning", "Please enter an access token for the bot");
            return;
        }

        this.isSaving = true;

        const config = {
            name: this.bot.name,
            avatarUrl: this.bot.avatarUrl,
            userId: this.bot.userId,
            accessToken: this.bot.accessToken,
            description: this.bot.description,
            isEnabled: true,
            isPublic: true,
        };

        let promise = null;
        if (this.isAdding) {
            promise = this.botApi.createBot(config);
        } else {
            promise = this.botApi.updateBot(this.bot.id, config);
        }

        promise.then(() => {
            this.toaster.pop("success", "Bot updated");
            this.dialog.close();
        }).catch(error => {
            this.isSaving = false;
            console.error(error);
            this.toaster.pop("error", "Error updating bot");
        });
    }
}
