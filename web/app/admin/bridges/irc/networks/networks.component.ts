import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { FE_IrcBridge } from "../../../../shared/models/irc";
import { AdminIrcApiService } from "../../../../shared/services/admin/admin-irc-api.service";
import { TranslateService } from "@ngx-translate/core";

export class IrcNetworksDialogContext extends BSModalContext {
    public bridge: FE_IrcBridge;
}

interface LocalNetwork {
    id: string;
    name: string;
    domain: string;
    bridgeUserId: string;
    isEnabled: boolean;
}

@Component({
    templateUrl: "./networks.component.html",
    styleUrls: ["./networks.component.scss"],
})
export class AdminIrcBridgeNetworksComponent implements ModalComponent<IrcNetworksDialogContext> {

    public isUpdating = false;
    public bridge: FE_IrcBridge;
    public networks: LocalNetwork[];

    constructor(public dialog: DialogRef<IrcNetworksDialogContext>,
                private ircApi: AdminIrcApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
        this.bridge = dialog.context.bridge;

        const networkIds = Object.keys(this.bridge.availableNetworks);
        this.networks = networkIds.map(i => {
            return {
                id: i,
                name: this.bridge.availableNetworks[i].name,
                domain: this.bridge.availableNetworks[i].domain,
                bridgeUserId: this.bridge.availableNetworks[i].bridgeUserId,
                isEnabled: this.bridge.availableNetworks[i].isEnabled,
            };
        });
    }

    public toggleNetwork(network: LocalNetwork) {
        network.isEnabled = !network.isEnabled;
        this.bridge.availableNetworks[network.id].isEnabled = network.isEnabled;

        this.isUpdating = true;
        this.ircApi.setNetworkEnabled(this.bridge.id, network.id, network.isEnabled).then(() => {
            this.isUpdating = false;
            this.translate.get(['Enabled', 'disabled']).subscribe((res: string) => {this.toaster.pop("success", "Network " + (network.isEnabled ? res[0] : res[1])); });
        }).catch(err => {
            console.error(err);
            this.isUpdating = false;
            network.isEnabled = !network.isEnabled;
            this.bridge.availableNetworks[network.id].isEnabled = network.isEnabled;
            this.translate.get('Failed to update network').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
