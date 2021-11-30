import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import {
    AdminHookshotGithubBridgeManageSelfhostedComponent,
    ManageSelfhostedHookshotGithubBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { FE_TelegramBridge } from "../../../shared/models/telegram";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AdminHookshotGithubApiService } from "../../../shared/services/admin/admin-hookshot-github-api.service";
import { FE_HookshotGithubBridge } from "../../../shared/models/hookshot_github";

@Component({
    templateUrl: "./hookshot-github.component.html",
    styleUrls: ["./hookshot-github.component.scss"],
})
export class AdminHookshotGithubBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_TelegramBridge[] = [];

    constructor(private hookshotApi: AdminHookshotGithubApiService,
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
        const selfhostedRef = this.modal.open(AdminHookshotGithubBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated Github bridge list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedHookshotGithubBridgeDialogContext;
        selfhostedInstance.provisionUrl = '';
        selfhostedInstance.sharedSecret = '';
    }

    public editBridge(bridge: FE_HookshotGithubBridge) {
        const selfhostedRef = this.modal.open(AdminHookshotGithubBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated Github bridge list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedHookshotGithubBridgeDialogContext;
        selfhostedInstance.provisionUrl = bridge.provisionUrl;
        selfhostedInstance.sharedSecret = bridge.sharedSecret;
        selfhostedInstance.bridgeId = bridge.id;
        selfhostedInstance.isAdding = !bridge.id;
    }
}
