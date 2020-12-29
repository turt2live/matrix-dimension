import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import {
    AdminGitterBridgeManageSelfhostedComponent,
    ManageSelfhostedGitterBridgeDialogContext
} from "./manage-selfhosted/manage-selfhosted.component";
import { AdminGitterApiService } from "../../../shared/services/admin/admin-gitter-api.service";
import { FE_GitterBridge } from "../../../shared/models/gitter";
import { FE_Upstream } from "../../../shared/models/admin-responses";
import { AdminUpstreamApiService } from "../../../shared/services/admin/admin-upstream-api.service";
import { TranslateService } from "@ngx-translate/core";

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
            this.configurations = await this.gitterApi.getBridges();
        } catch (err) {
            console.error(err);
            this.translate.get('Error loading bridges').subscribe((res: string) => {this.toaster.pop("error", res); } );
        }
    }

    public addModularHostedBridge() {
        this.isUpdating = true;

        const createBridge = (upstream: FE_Upstream) => {
            return this.gitterApi.newFromUpstream(upstream).then(bridge => {
                this.configurations.push(bridge);
                this.translate.get('matrix.org\'s Gitter bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.isUpdating = false;
            }).catch(err => {
                console.error(err);
                this.isUpdating = false;
                this.translate.get('Error adding matrix.org\'s Gitter Bridge').subscribe((res: string) => {this.toaster.pop("error", res); } );
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
                this.translate.get('Error creating matrix.org\'s Gitter Bridge').subscribe((res: string) => {this.toaster.pop("error", res); } );
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
                this.translate.get('Failed to get an update Gitter bridge list').subscribe((res: string) => {this.toaster.pop("error", res); } );
            });
        });
    }

    public editBridge(bridge: FE_GitterBridge) {
        this.modal.open(AdminGitterBridgeManageSelfhostedComponent, overlayConfigFactory({
            isBlocking: true,
            size: 'lg',

            provisionUrl: bridge.provisionUrl,
            bridgeId: bridge.id,
        }, ManageSelfhostedGitterBridgeDialogContext)).result.then(() => {
            this.reload().catch(err => {
                console.error(err);
                this.translate.get('Failed to get an update Gitter bridge list').subscribe((res: string) => {this.toaster.pop("error", res); } );
            });
        });
    }
}
