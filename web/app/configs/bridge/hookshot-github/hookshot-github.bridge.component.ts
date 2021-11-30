import { Component, OnInit } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { FE_SlackChannel, FE_SlackLink, FE_SlackTeam } from "../../../shared/models/slack";
import { SlackApiService } from "../../../shared/services/integrations/slack-api.service";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { FE_HookshotGithubBridge, FE_HookshotGithubConnection } from "../../../shared/models/hookshot_github";
import { HookshotGithubApiService } from "../../../shared/services/integrations/hookshot-github-api.service";

interface HookshotConfig {
    botUserId: string;
    connections: FE_HookshotGithubConnection[];
}

@Component({
    templateUrl: "hookshot-github.bridge.component.html",
    styleUrls: ["hookshot-github.bridge.component.scss"],
})
export class HookshotGithubBridgeConfigComponent extends BridgeComponent<HookshotConfig> implements OnInit {

    public isBusy: boolean;
    public needsAuth = false;
    public authUrl: SafeUrl;
    public loadingConnections = false;
    public orgs: string[] = [];
    public repos: string[] = []; // for org
    public orgId: string;
    public repoId: string;

    constructor(private hookshot: HookshotGithubApiService, private scalar: ScalarClientApiService, public translate: TranslateService) {
        super("hookshot_github", translate);
        this.translate = translate;
    }

    public ngOnInit() {
        super.ngOnInit();

        this.prepare();
    }

    private prepare() {

    }

    public loadRepos() {
        // TODO
    }

    public get isBridged(): boolean {
        return this.bridge.config.connections.length > 0;
    }

    public async bridgeRoom(): Promise<any> {
        this.isBusy = true;

        try {
            await this.scalar.inviteUser(this.roomId, this.bridge.config.botUserId);
        } catch (e) {
            if (!e.response || !e.response.error || !e.response.error._error ||
                e.response.error._error.message.indexOf("already in the room") === -1) {
                this.isBusy = false;
                this.translate.get('Error inviting bridge').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
                return;
            }
        }

        this.hookshot.bridgeRoom(this.roomId).then(conn => {
            this.bridge.config.connections.push(conn);
            this.isBusy = false;
            this.translate.get('Bridge requested').subscribe((res: string) => {
                this.toaster.pop("success", res);
            });
        }).catch(error => {
            this.isBusy = false;
            console.error(error);
            this.translate.get('Error requesting bridge').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }

    public unbridgeRoom(): void {
        this.isBusy = true;
        this.hookshot.unbridgeRoom(this.roomId).then(() => {
            this.bridge.config.connections = [];
            this.isBusy = false;
            this.translate.get('Bridge removed').subscribe((res: string) => {
                this.toaster.pop("success", res);
            });
        }).catch(error => {
            this.isBusy = false;
            console.error(error);
            this.translate.get('Error removing bridge').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }
}
