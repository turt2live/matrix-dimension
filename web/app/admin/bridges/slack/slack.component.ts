import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { FE_Upstream } from "../../../shared/models/admin-responses";
import { AdminUpstreamApiService } from "../../../shared/services/admin/admin-upstream-api.service";
import {
    AdminSlackBridgeManageSelfhostedComponent,
    ManageSelfhostedSlackBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { FE_SlackBridge } from "../../../shared/models/slack";
import { AdminSlackApiService } from "../../../shared/services/admin/admin-slack-api.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "./slack.component.html",
    styleUrls: ["./slack.component.scss"],
})
export class AdminSlackBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_SlackBridge[] = [];

    private upstreams: FE_Upstream[];

    constructor(private slackApi: AdminSlackApiService,
                private upstreamApi: AdminUpstreamApiService,
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
            this.upstreams = await this.upstreamApi.getUpstreams();
            this.configurations = await this.slackApi.getBridges();
        } catch (err) {
            console.error(err);
            this.translate.get('Error loading bridges').subscribe((res: string) => {this.toaster.pop("error", res); });
        }
    }

    public addModularHostedBridge() {
        this.isUpdating = true;

        const createBridge = (upstream: FE_Upstream) => {
            return this.slackApi.newFromUpstream(upstream).then(bridge => {
                this.configurations.push(bridge);
                this.translate.get('matrix.org\'s Slack bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.isUpdating = false;
            }).catch(err => {
                console.error(err);
                this.isUpdating = false;
                this.translate.get('Error adding matrix.org\'s Slack Bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        };

        const vectorUpstreams = this.upstreams.filter(u => u.type === "vector");
        if (vectorUpstreams.length === 0) {
            console.log("Creating default scalar upstream");
            const scalarUrl = "https://scalar.vector.im/api";
            this.upstreamApi.newUpstream("modular", "vector", scalarUrl, scalarUrl).then(upstream => {
                this.upstreams.push(upstream);
                createBridge(upstream);
            }).catch(err => {
                console.error(err);
                this.translate.get('Error creating matrix.org\'s Slack Bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        } else createBridge(vectorUpstreams[0]);
    }

    public addSelfHostedBridge() {
        this.modal.open(AdminSlackBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: '',
        }, ManageSelfhostedSlackBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.translate.get('Failed to get an update Slack bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        });
    }

    public editBridge(bridge: FE_SlackBridge) {
        this.modal.open(AdminSlackBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: bridge.provisionUrl,
            bridgeId: bridge.id,
        }, ManageSelfhostedSlackBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.translate.get('Failed to get an update Slack bridge list').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        });
    }
}
