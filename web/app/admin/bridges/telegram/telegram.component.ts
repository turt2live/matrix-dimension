import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import {
    AdminTelegramBridgeManageSelfhostedComponent,
    ManageSelfhostedTelegramBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { FE_TelegramBridge } from "../../../shared/models/telegram";
import { AdminTelegramApiService } from "../../../shared/services/admin/admin-telegram-api.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
                private modal: NgbModal,
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
        const selfhostedRef = this.modal.open(AdminTelegramBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an update Telegram bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedTelegramBridgeDialogContext;
        selfhostedInstance.provisionUrl = '';
        selfhostedInstance.sharedSecret = '';
        selfhostedInstance.allowMxPuppets = false;
        selfhostedInstance.allowTgPuppets = false;
    }

    public getEnabledFeaturesString(bridge: FE_TelegramBridge): string {
        if (!bridge.options) return "";
        if (bridge.options.allowTgPuppets) return "Telegram Puppetting";
        if (bridge.options.allowMxPuppets) return "Matrix Puppetting";
        return "";
    }

    public editBridge(bridge: FE_TelegramBridge) {
        const selfhostedRef = this.modal.open(AdminTelegramBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an update Telegram bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedTelegramBridgeDialogContext;
        selfhostedInstance.provisionUrl = bridge.provisionUrl;
        selfhostedInstance.sharedSecret = bridge.sharedSecret;
        selfhostedInstance.allowMxPuppets = bridge.options?.allowTgPuppets || false;
        selfhostedInstance.allowTgPuppets = bridge.options?.allowMxPuppets || false;
        selfhostedInstance.bridgeId = bridge.id;
        selfhostedInstance.isAdding = !bridge.id;
    }
}
