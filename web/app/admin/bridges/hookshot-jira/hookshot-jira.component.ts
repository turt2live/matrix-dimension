import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import {
    AdminHookshotJiraBridgeManageSelfhostedComponent,
    ManageSelfhostedHookshotJiraBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FE_HookshotJiraBridge } from "../../../shared/models/hookshot_jira";
import { AdminHookshotJiraApiService } from "../../../shared/services/admin/admin-hookshot-jira-api.service";

@Component({
    templateUrl: "./hookshot-jira.component.html",
    styleUrls: ["./hookshot-jira.component.scss"],
})
export class AdminHookshotJiraBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_HookshotJiraBridge[] = [];

    constructor(private hookshotApi: AdminHookshotJiraApiService,
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
        const selfhostedRef = this.modal.open(AdminHookshotJiraBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated Jira bridge list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedHookshotJiraBridgeDialogContext;
        selfhostedInstance.provisionUrl = '';
        selfhostedInstance.sharedSecret = '';
    }

    public editBridge(bridge: FE_HookshotJiraBridge) {
        const selfhostedRef = this.modal.open(AdminHookshotJiraBridgeManageSelfhostedComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        selfhostedRef.result.then(() => {
            try {
                this.reload()
            } catch (err) {
                console.error(err);
                this.translate.get('Failed to get an updated Jira bridge list').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        })
        const selfhostedInstance = selfhostedRef.componentInstance as ManageSelfhostedHookshotJiraBridgeDialogContext;
        selfhostedInstance.provisionUrl = bridge.provisionUrl;
        selfhostedInstance.sharedSecret = bridge.sharedSecret;
        selfhostedInstance.bridgeId = bridge.id;
        selfhostedInstance.isAdding = !bridge.id;
    }
}
