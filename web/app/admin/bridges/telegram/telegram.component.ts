import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import {
    AdminTelegramBridgeManageSelfhostedComponent,
    ManageSelfhostedTelegramBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { FE_TelegramBridge } from "../../../shared/models/telegram";
import { AdminTelegramApiService } from "../../../shared/services/admin/admin-telegram-api.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "./telegram.component.html",
    styleUrls: ["./telegram.component.scss"],
})
export class AdminTelegramBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_TelegramBridge[] = [];

    constructor(private telegramApi: AdminTelegramApiService,
                private toaster: ToasterService,
                private modal: Modal,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public ngOnInit() {
        this.reload().then(() => this.isLoading = false);
    }

    private async reload(): Promise<any> {
        try {
            this.configurations = await this.telegramApi.getBridges();
        } catch (err) {
            console.error(err);
            this.translate.get('Error loading bridges').subscribe((res: string) => {this.toaster.pop("error", res); });
        }
    }

    public addSelfHostedBridge() {
        this.modal.open(AdminTelegramBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: '',
            sharedSecret: '',
            allowPuppets: false,
        }, ManageSelfhostedTelegramBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.translate.get('Failed to get an update Telegram bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        });
    }

    public getEnabledFeaturesString(bridge: FE_TelegramBridge): string {
        if (!bridge.options) return "";
        if (bridge.options.allowTgPuppets) return "Telegram Puppetting";
        if (bridge.options.allowMxPuppets) return "Matrix Puppetting";
        return "";
    }

    public editBridge(bridge: FE_TelegramBridge) {
        this.modal.open(AdminTelegramBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: bridge.provisionUrl,
            sharedSecret: bridge.sharedSecret,
            allowTgPuppets: bridge.options ? bridge.options.allowTgPuppets : false,
            allowMxPuppets: bridge.options ? bridge.options.allowMxPuppets : false,
            bridgeId: bridge.id,
        }, ManageSelfhostedTelegramBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.translate.get('Failed to get an update Telegram bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        });
    }
}
