import { Component } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { FE_IrcBridgeAvailableNetworks } from "../../../shared/models/irc";
import { IrcApiService } from "../../../shared/services/integrations/irc-api.service";
import { TranslateService } from "@ngx-translate/core";

interface IrcConfig {
    availableNetworks: FE_IrcBridgeAvailableNetworks;
    links: {
        [networkId: string]: {
            channelName: string;
        }[];
    };
}

interface LocalChannel {
    name: string;
    networkId: string;
    networkName: string;
    pending: boolean;
}

@Component({
    templateUrl: "irc.bridge.component.html",
    styleUrls: ["irc.bridge.component.scss"],
})
export class IrcBridgeConfigComponent extends BridgeComponent<IrcConfig> {

    public loadingOps = false;
    public requestingBridge = false;
    public channelStep = 1;
    public networkId: string;
    public channel = "";
    public ops: string[];
    public op: string;
    public pending: LocalChannel[] = [];

    constructor(private irc: IrcApiService, public translate: TranslateService) {
        super("irc", translate);
        this.translate = translate;
    }

    private resetForm() {
        this.networkId = this.getNetworks()[0].id;
        this.channel = "";
        this.ops = [];
        this.channelStep = 1;
    }

    public getNetworks(): { id: string, name: string }[] {
        const ids = Object.keys(this.bridge.config.availableNetworks);
        if (!this.networkId) setTimeout(() => this.networkId = ids[0], 0);
        return ids.map(i => {
            return {id: i, name: this.bridge.config.availableNetworks[i].name};
        });
    }

    public loadOps() {
        if (!this.channel.trim()) {
            this.translate.get('Please enter a channel name').subscribe((res: string) => {this.toaster.pop("warning", res); });
            return;
        }

        this.loadingOps = true;
        this.irc.getOperators(this.networkId, this.channel).then(ops => {
            this.ops = ops;
            this.op = ops[0];
            this.loadingOps = false;
            this.channelStep = 2;
        }).catch(err => {
            console.error(err);
            this.loadingOps = false;
            this.translate.get('Error loading channel operators').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public async requestBridge() {
        this.requestingBridge = true;
        const bridgeUserId = this.bridge.config.availableNetworks[this.networkId].bridgeUserId;

        const memberEvent = await this.scalarClientApi.getMembershipState(this.roomId, bridgeUserId);
        const isJoined = memberEvent && memberEvent.response && ["join", "invite"].indexOf(memberEvent.response.membership) !== -1;

        if (!isJoined) await this.scalarClientApi.inviteUser(this.roomId, bridgeUserId);

        try {
            await this.scalarClientApi.setUserPowerLevel(this.roomId, bridgeUserId, 100);
        } catch (err) {
            console.error(err);
            this.requestingBridge = false;
            this.translate.get(['Failed to make the bridge an administrator', 'Please ensure you are an \'Admin\' for the room']).subscribe((res: string) => {this.toaster.pop("error", res[0], res[1]); });
            return;
        }

        this.irc.requestLink(this.roomId, this.networkId, this.channel, this.op).then(() => {
            this.requestingBridge = false;
            this.pending.push({
                name: this.channel,
                networkId: this.networkId,
                networkName: this.bridge.config.availableNetworks[this.networkId].name,
                pending: true,
            });
            this.resetForm();
            this.translate.get(['Link requested!', 'The operator selected will have to approve the bridge for it to work']).subscribe((res: string) => {this.toaster.pop("success", res[0], res[1]); });
        }).catch(err => {
            console.error(err);
            this.requestingBridge = false;
            this.translate.get('Failed to request a link').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public getChannels(): LocalChannel[] {
        const channels: LocalChannel[] = [];
        this.pending.forEach(p => channels.push(p));

        for (const networkId of Object.keys(this.bridge.config.links)) {
            const network = this.bridge.config.availableNetworks[networkId];

            for (const channel of this.bridge.config.links[networkId]) {
                channels.push({
                    networkId: networkId,
                    networkName: network.name,
                    name: channel.channelName,
                    pending: false,
                });
            }
        }

        return channels;
    }

    public removeChannel(channel: LocalChannel) {
        this.isUpdating = true;
        this.irc.removeLink(this.roomId, channel.networkId, channel.name.substring(1)).then(() => {
            this.isUpdating = false;
            const idx = this.bridge.config.links[channel.networkId].findIndex(c => c.channelName === channel.name);
            if (idx !== -1) this.bridge.config.links[channel.networkId].splice(idx, 1);
            this.translate.get('Link removed').subscribe((res: string) => {this.toaster.pop("success", res); });
        }).catch(err => {
            console.error(err);
            this.translate.get('Failed to remove link').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
