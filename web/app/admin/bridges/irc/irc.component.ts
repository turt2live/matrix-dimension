import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { AdminIrcApiService } from "../../../shared/services/admin/admin-irc-api.service";
import { FE_Upstream } from "../../../shared/models/admin-responses";
import { AdminUpstreamApiService } from "../../../shared/services/admin/admin-upstream-api.service";
import { FE_IrcBridge } from "../../../shared/models/irc";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { AdminIrcBridgeNetworksComponent, IrcNetworksDialogContext } from "./networks/networks.component";

@Component({
    templateUrl: "./irc.component.html",
    styleUrls: ["./irc.component.scss"],
})
export class AdminIrcBridgeComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public hasModularBridge = false;
    public configurations: FE_IrcBridge[] = [];

    private upstreams: FE_Upstream[];

    constructor(private upstreamApi: AdminUpstreamApiService,
                private ircApi: AdminIrcApiService,
                private toaster: ToasterService,
                private modal: Modal) {
    }

    public ngOnInit() {
        this.reload().then(() => this.isLoading = false);
    }

    private async reload(): Promise<any> {
        try {
            this.upstreams = await this.upstreamApi.getUpstreams();
            this.configurations = await this.ircApi.getBridges();

            this.hasModularBridge = false;
            for (const bridge of this.configurations) {
                if (bridge.upstreamId) {
                    this.hasModularBridge = true;
                    break;
                }
            }
        } catch (err) {
            console.error(err);
            this.toaster.pop("error", "Error loading bridges");
        }
    }

    public getEnabledNetworksString(bridge: FE_IrcBridge): string {
        const networkIds = Object.keys(bridge.availableNetworks);
        const result = networkIds.filter(i => bridge.availableNetworks[i].isEnabled)
            .map(i => bridge.availableNetworks[i].name)
            .join(", ");
        if (!result) return "None";
        return result;
    }

    public addModularHostedBridge() {
        this.isUpdating = true;

        const createBridge = (upstream: FE_Upstream) => {
            return this.ircApi.newFromUpstream(upstream).then(bridge => {
                this.configurations.push(bridge);
                this.toaster.pop("success", "matrix.org's IRC bridge added", "Click the pencil icon to enable networks.");
                this.isUpdating = false;
                this.hasModularBridge = true;
            }).catch(err => {
                console.error(err);
                this.isUpdating = false;
                this.toaster.pop("error", "Error adding matrix.org's IRC Bridge");
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
                this.toaster.pop("error", "Error creating matrix.org's IRC Bridge");
            });
        } else createBridge(vectorUpstreams[0]);
    }

    public addSelfHostedBridge() {
        console.log("TODO: Dialog");
    }

    public editNetworks(bridge: FE_IrcBridge) {
        this.modal.open(AdminIrcBridgeNetworksComponent, overlayConfigFactory({
            bridge: bridge,

            isBlocking: true,
            size: 'lg',
        }, IrcNetworksDialogContext));
    }
}
