import { Component, OnDestroy } from "@angular/core";
import { IRCIntegration } from "../../shared/models/integration";
import { ModalComponent, DialogRef } from "angular2-modal";
import { ConfigModalContext } from "../../integration/integration.component";
import { IrcApiService } from "../../shared/irc-api.service";
import { ToasterService } from "angular2-toaster";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { ApiService } from "../../shared/api.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'my-irc-config',
    templateUrl: './irc-config.component.html',
    styleUrls: ['./irc-config.component.scss', './../config.component.scss'],
})
export class IrcConfigComponent implements ModalComponent<ConfigModalContext>, OnDestroy {

    public integration: IRCIntegration;
    public loadingOps = false;
    public opsLoaded = false;
    public addingChannel = false;
    public newChannel = {
        network: "",
        channel: "",
        op: ""
    };
    public channelOps: string[];
    public opsError: string = null;
    public channelLinks: ChannelLink[];

    private roomId: string;
    private scalarToken: string;
    private stateTimer: Subscription;

    constructor(public dialog: DialogRef<ConfigModalContext>,
                private ircApi: IrcApiService,
                private toaster: ToasterService,
                private api: ApiService) {
        this.integration = <IRCIntegration>dialog.context.integration;
        this.roomId = dialog.context.roomId;
        this.scalarToken = dialog.context.scalarToken;

        this.newChannel.network = this.integration.availableNetworks[0].id;
        this.buildChannelLinks();

        this.stateTimer = IntervalObservable.create(5000).subscribe(() => {
            this.api.getIntegrationState(this.roomId, this.integration.type, this.integration.integrationType, this.scalarToken)
                .then(state => {
                    for (let key in state) {
                        this.integration[key] = state[key];
                    }
                    this.buildChannelLinks();
                });
        });
    }

    public ngOnDestroy(): void {
        this.stateTimer.unsubscribe();
    }

    public checkOps(): void {
        if (this.newChannel.channel.trim().length === 0) {
            this.toaster.pop("warning", "Please enter a channel name");
            return;
        }

        this.loadingOps = true;
        this.ircApi.getChannelOps(this.roomId, this.newChannel.network, this.newChannel.channel, this.scalarToken).then(ops => {
            this.channelOps = ops;
            if (this.channelOps.length === 0) {
                this.opsError = "No channel operators available";
            } else {
                this.newChannel.op = this.channelOps[0];
                this.loadingOps = false;
                this.opsLoaded = true;
            }
        }).catch(err => {
            this.toaster.pop("error", err.json().error);
            console.error(err);
            this.loadingOps = false;
        });
    }

    public getNewChannelNetworkName(): string {
        for (let network of this.integration.availableNetworks) {
            if (network.id === this.newChannel.network) {
                return network.name;
            }
        }
        return "Unknown";
    }

    public addChannel(): void {
        this.addingChannel = true;
        this.ircApi.linkChannel(
            this.roomId,
            this.newChannel.network,
            this.newChannel.channel,
            this.newChannel.op,
            this.scalarToken)
            .then(() => {
                this.newChannel = {
                    network: this.integration.availableNetworks[0].id,
                    channel: "",
                    op: ""
                };
                this.channelOps = [];
                this.addingChannel = false;
                this.opsLoaded = false;

                this.toaster.pop("success", "Channel bridge requested");
            })
            .catch(err => {
                this.toaster.pop("error", err.json().error);
                console.error(err);
                this.addingChannel = false;
            });
    }

    private buildChannelLinks(): void {
        this.channelLinks = [];

        for (let network in this.integration.channels) {
            if (this.integration.channels[network].length <= 0) continue;

            let displayName = "Unknown Network";
            for (let parentNetwork of this.integration.availableNetworks) {
                if (parentNetwork.id === network) {
                    displayName = parentNetwork.name;
                    break;
                }
            }

            this.channelLinks.push({
                displayName: displayName,
                network: network,
                channels: this.integration.channels[network],
                beingRemoved: []
            });
        }
    }

    public removeChannelLink(link: ChannelLink, channel: string): void {
        link.beingRemoved.push(channel);
        this.ircApi.unlinkChannel(this.roomId, link.network, channel.substring(1), this.scalarToken).then(() => {
            this.toaster.pop("success", "Channel " + channel + " unlinked");

            link.channels.splice(link.channels.indexOf(channel), 1);
            link.beingRemoved.splice(link.beingRemoved.indexOf(channel), 1);

            if (link.channels.length === 0) {
                this.channelLinks.splice(this.channelLinks.indexOf(link), 1);
            }
        }).catch(err => {
            this.toaster.pop("error", err.json().error);
            console.error(err);

            link.beingRemoved.splice(link.beingRemoved.indexOf(channel), 1);
        });
    }
}

interface ChannelLink {
    displayName: string;
    channels: string[];
    network: string;
    beingRemoved: string[];
}
