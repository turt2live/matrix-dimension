import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { FE_CustomSimpleBot } from "../../shared/models/admin-responses";
import { AdminCustomSimpleBotsApiService } from "../../shared/services/admin/admin-custom-simple-bots-api.service";
import { AddCustomBotDialogContext, AdminAddCustomBotComponent } from "./add/add.component";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
        private modal: NgbModal,
        public translate: TranslateService) {
        this.translate = translate;

        this.reload().then(() => this.isLoading = false).catch(error => {
            console.error(error);
            this.translate.get('Error loading go-neb configuration').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }

    private reload(): Promise<any> {
        return this.botApi.getBots().then(bots => {
            this.bots = bots;
            this.isLoading = false;
        });
    }

    public addBot() {
        const selfhostedRef = this.modal.open(AdminAddCustomBotComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated bot list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        });
    }

    public editBot(bot: FE_CustomSimpleBot) {
        const selfhostedRef = this.modal.open(AdminAddCustomBotComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated bot list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        });
        const selfhostedInstance = selfhostedRef.componentInstance as AddCustomBotDialogContext;
        selfhostedInstance.bot = bot;
        selfhostedInstance.isAdding = !bot;
    }

    public toggleBot(bot: FE_CustomSimpleBot) {
        this.isUpdating = true;
        bot.isEnabled = !bot.isEnabled;
        this.botApi.updateBot(bot.id, bot).then(() => {
            this.isUpdating = false;
            this.translate.get(['Enabled', 'disabled']).subscribe((res: string) => {
                this.toaster.pop("success", "Bot " + (bot.isEnabled ? res[0] : res[1]));
            });
        }).catch(error => {
            console.error(error);
            bot.isEnabled = !bot.isEnabled;
            this.translate.get('Error updating bot').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        })
    }
}
