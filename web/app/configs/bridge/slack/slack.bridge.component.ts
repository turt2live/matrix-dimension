import { Component, OnInit } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { FE_SlackChannel, FE_SlackLink, FE_SlackTeam } from "../../../shared/models/slack";
import { SlackApiService } from "../../../shared/services/integrations/slack-api.service";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

interface SlackConfig {
    botUserId: string;
    link: FE_SlackLink;
}

@Component({
    templateUrl: "slack.bridge.component.html",
    styleUrls: ["slack.bridge.component.scss"],
})
export class SlackBridgeConfigComponent extends BridgeComponent<SlackConfig> implements OnInit {

    public teamId: string;
    public channelId: string;
    public teams: FE_SlackTeam[];
    public channels: FE_SlackChannel[];
    public isBusy: boolean;
    public loadingTeams = true;
    public needsAuth = false;
    public authUrl: SafeUrl;

    private timerId: any;

    constructor(private slack: SlackApiService, private scalar: ScalarClientApiService, private sanitizer: DomSanitizer) {
        super("slack");
    }

    public ngOnInit() {
        super.ngOnInit();

        this.tryLoadTeams();
    }

    private tryLoadTeams() {
        this.slack.getTeams().then(teams => {
            this.teams = teams;
            this.teamId = this.teams[0].id;
            this.needsAuth = false;
            this.loadingTeams = false;
            this.loadChannels();

            if (this.timerId) {
                clearInterval(this.timerId);
            }
        }).catch(error => {
            if (error.status === 404) {
                this.needsAuth = true;

                if (!this.authUrl) {
                    this.slack.getAuthUrl().then(url => {
                        this.authUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                        this.loadingTeams = false;
                    }).catch(error2 => {
                        console.error(error2);
                        this.toaster.pop("error", "Error getting Slack authorization information");
                    });

                    this.timerId = setInterval(() => {
                        this.tryLoadTeams();
                    }, 1000);
                }
            } else {
                console.error(error);
                this.toaster.pop("error", "Error getting teams");
            }
        });
    }

    public get isBridged(): boolean {
        return !!this.bridge.config.link;
    }

    public loadChannels() {
        this.isBusy = true;
        this.slack.getChannels(this.teamId).then(channels => {
            this.channels = channels;
            this.channelId = this.channels[0].id;
            this.isBusy = false;
        }).catch(error => {
            console.error(error);
            this.toaster.pop("error", "Error getting channels for team");
            this.isBusy = false;
        });
    }

    public async bridgeRoom(): Promise<any> {
        this.isBusy = true;

        try {
            await this.scalar.inviteUser(this.roomId, this.bridge.config.botUserId);
        } catch (e) {
            if (!e.response || !e.response.error || !e.response.error._error ||
                e.response.error._error.message.indexOf("already in the room") === -1) {
                this.isBusy = false;
                this.toaster.pop("error", "Error inviting bridge");
                return;
            }
        }

        this.slack.bridgeRoom(this.roomId, this.teamId, this.channelId).then(link => {
            this.bridge.config.link = link;
            this.isBusy = false;
            this.toaster.pop("success", "Bridge requested");
        }).catch(error => {
            this.isBusy = false;
            console.error(error);
            this.toaster.pop("error", "Error requesting bridge");
        });
    }

    public unbridgeRoom(): void {
        this.isBusy = true;
        this.slack.unbridgeRoom(this.roomId).then(() => {
            this.bridge.config.link = null;
            this.isBusy = false;
            this.toaster.pop("success", "Bridge removed");
        }).catch(error => {
            this.isBusy = false;
            console.error(error);
            this.toaster.pop("error", "Error removing bridge");
        });
    }
}