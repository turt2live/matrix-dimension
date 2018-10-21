import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { FE_TelegramBridge } from "../../../shared/models/telegram";
import {
    AdminGitterBridgeManageSelfhostedComponent,
    ManageSelfhostedGitterBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { AdminGitterApiService } from "../../../shared/services/admin/admin-gitter-api.service";
import { FE_GitterBridge } from "../../../shared/models/gitter";
import { FE_Upstream } from "../../../shared/models/admin-responses";
import { AdminUpstreamApiService } from "../../../shared/services/admin/admin-upstream-api.service";

@Component({
    templateUrl: "./gitter.component.html",
    styleUrls: ["./gitter.component.scss"],
})
export class AdminGitterBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public configurations: FE_GitterBridge[] = [];

    private upstreams: FE_Upstream[];

    constructor(private gitterApi: AdminGitterApiService,
                private upstreamApi: AdminUpstreamApiService,
                private toaster: ToasterService,
                private modal: Modal) {
    }

    public ngOnInit() {
        this.reload().then(() => this.isLoading = false);
    }

    private async reload(): Promise<any> {
        try {
            this.upstreams = await this.upstreamApi.getUpstreams();
            this.configurations = await this.gitterApi.getBridges();
        } catch (err) {
            console.error(err);
            this.toaster.pop("error", "Error loading bridges");
        }
    }

    public addModularHostedBridge() {
        this.isUpdating = true;

        const createBridge = (upstream: FE_Upstream) => {
            return this.gitterApi.newFromUpstream(upstream).then(bridge => {
                this.configurations.push(bridge);
                this.toaster.pop("success", "matrix.org's Gitter bridge added");
                this.isUpdating = false;
            }).catch(err => {
                console.error(err);
                this.isUpdating = false;
                this.toaster.pop("error", "Error adding matrix.org's Gitter Bridge");
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
                this.toaster.pop("error", "Error creating matrix.org's Gitter Bridge");
            });
        } else createBridge(vectorUpstreams[0]);
    }

    public addSelfHostedBridge() {
        this.modal.open(AdminGitterBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: '',
        }, ManageSelfhostedGitterBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.toaster.pop("error", "Failed to get an update Gitter bridge list");
            });
        });
    }

    public editBridge(bridge: FE_TelegramBridge) {
        this.modal.open(AdminGitterBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: bridge.provisionUrl,
            bridgeId: bridge.id,
        }, ManageSelfhostedGitterBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.toaster.pop("error", "Failed to get an update Gitter bridge list");
            });
        });
    }
}
