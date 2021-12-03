import { Component, OnInit } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { HookshotJiraApiService } from "../../../shared/services/integrations/hookshot-jira-api.service";
import {
    FE_HookshotJiraConnection,
    FE_HookshotJiraInstance,
    FE_HookshotJiraProject
} from "../../../shared/models/hookshot_jira";

interface HookshotConfig {
    botUserId: string;
    connections: FE_HookshotJiraConnection[];
    loggedIn: boolean;
    instances?: FE_HookshotJiraInstance[];
}

@Component({
    templateUrl: "hookshot-jira.bridge.component.html",
    styleUrls: ["hookshot-jira.bridge.component.scss"],
})
export class HookshotJiraBridgeConfigComponent extends BridgeComponent<HookshotConfig> implements OnInit {

    public isBusy: boolean;
    public authUrl: SafeUrl;
    public loadingConnections = true;
    public bridgedProjectUrl: SafeUrl;
    public bridgedProjectUrlUnsafe: string;

    public instances: FE_HookshotJiraInstance[] = [];
    public instance: FE_HookshotJiraInstance;

    public projects: FE_HookshotJiraProject[] = [];
    public project: FE_HookshotJiraProject;

    private timerId: any;

    constructor(private hookshot: HookshotJiraApiService, private scalar: ScalarClientApiService, private sanitizer: DomSanitizer, public translate: TranslateService) {
        super("hookshot_jira", translate);
    }

    public ngOnInit() {
        super.ngOnInit();

        this.loadingConnections = true;
        this.tryLoadInstances();
    }

    private tryLoadInstances() {
        this.hookshot.getInstances().then(r => {
            this.authUrl = null;
            this.instances = r;
            this.instance = this.instances[0];
            this.loadProjects();

            if (this.timerId) {
                clearTimeout(this.timerId);
            }
        }).catch(e => {
            if (e.status === 403 && e.error.dim_errcode === "T2B_NOT_LOGGED_IN") {
                this.hookshot.getAuthUrl().then(url => {
                    this.authUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                    this.loadingConnections = false;
                    this.timerId = setTimeout(() => {
                        this.tryLoadInstances();
                    }, 1000);
                });
            } else {
                console.error(e);
                this.translate.get('Error getting Jira information').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        });
    }

    public loadProjects() {
        this.isBusy = true;
        this.hookshot.getProjects(this.instance.name).then(projects => {
            this.projects = projects;
            this.project = this.projects[0];

            if (this.isBridged) {
                this.bridgedProjectUrlUnsafe = this.bridge.config.connections[0].config.url;
                this.bridgedProjectUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.bridgedProjectUrlUnsafe);
            }

            this.isBusy = false;
            this.loadingConnections = false;
        }).catch(e => {
            console.error(e);
            this.isBusy = false;
            this.translate.get('Error getting Jira information').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
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

        await this.scalar.setUserPowerLevel(this.roomId, this.bridge.config.botUserId, 50);

        this.hookshot.bridgeRoom(this.roomId, this.instance.name, this.project.key).then(conn => {
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
