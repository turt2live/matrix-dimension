import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import {
    AdminHookshotWebhookBridgeManageSelfhostedComponent,
    ManageSelfhostedHookshotWebhookBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AdminHookshotWebhookApiService } from "../../../shared/services/admin/admin-hookshot-webhook-api.service";
import { FE_HookshotWebhookBridge } from "../../../shared/models/hookshot_webhook";

@Component({
    templateUrl: "./hookshot-webhook.component.html",
    styleUrls: ["./hookshot-webhook.component.scss"],
})
export class AdminHookshotWebhookBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_HookshotWebhookBridge[] = [];

    constructor(private hookshotApi: AdminHookshotWebhookApiService,
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
            this.configurations = await this.hookshotApi.getBridges();
        } catch (err) {
            console.error(err);
            this.translate.get('Error loading bridges').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        }
    }

    public addSelfHostedBridge() {
        const selfhostedRef = this.modal.open(AdminHookshotWebhookBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated Webhook bridge list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedHookshotWebhookBridgeDialogContext;
        selfhostedInstance.provisionUrl = '';
        selfhostedInstance.sharedSecret = '';
    }

    public editBridge(bridge: FE_HookshotWebhookBridge) {
        const selfhostedRef = this.modal.open(AdminHookshotWebhookBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated Webhook bridge list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedHookshotWebhookBridgeDialogContext;
        selfhostedInstance.provisionUrl = bridge.provisionUrl;
        selfhostedInstance.sharedSecret = bridge.sharedSecret;
        selfhostedInstance.bridgeId = bridge.id;
        selfhostedInstance.isAdding = !bridge.id;
    }
}
