import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import {
    AdminWebhooksBridgeManageSelfhostedComponent,
    ManageSelfhostedWebhooksBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { FE_WebhooksBridge } from "../../../shared/models/webhooks";
import { AdminWebhooksApiService } from "../../../shared/services/admin/admin-webhooks-api.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: "./webhooks.component.html",
    styleUrls: ["./webhooks.component.scss"],
})
export class AdminWebhooksBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_WebhooksBridge[] = [];

    constructor(private webhooksApi: AdminWebhooksApiService,
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
            this.configurations = await this.webhooksApi.getBridges();
        } catch (err) {
            console.error(err);
            this.translate.get('Error loading bridges').subscribe((res: string) => {this.toaster.pop("error", res); });
        }
    }

    public addSelfHostedBridge() {
        const selfhostedRef = this.modal.open(AdminWebhooksBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an update Webhooks bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            }
        });
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedWebhooksBridgeDialogContext;
        selfhostedInstance.provisionUrl = '';
        selfhostedInstance.sharedSecret = '';
        selfhostedInstance.allowMxPuppets = false;
        selfhostedInstance.allowTgPuppets = false;
    }

    public editBridge(bridge: FE_WebhooksBridge) {
        const selfhostedRef = this.modal.open(AdminWebhooksBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an update Webhooks bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            }
        });
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedWebhooksBridgeDialogContext;
        selfhostedInstance.provisionUrl = bridge.provisionUrl;
        selfhostedInstance.sharedSecret = bridge.sharedSecret
        selfhostedInstance.bridgeId = bridge.id;
        selfhostedInstance.isAdding = !bridge.id;
    }
}
