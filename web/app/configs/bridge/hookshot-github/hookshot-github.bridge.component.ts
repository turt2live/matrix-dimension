import { Component, OnInit } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { FE_HookshotGithubConnection } from "../../../shared/models/hookshot_github";
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
    public authUrl: SafeUrl;
    public orgAuthUrl: SafeUrl;
    public loadingConnections = true;
    public bridgedRepoSlug: string;

    public orgs: string[] = [];
    public orgId: string;

    public repos: string[] = []; // for org
    public repoId: string;

    private timerId: any;

    constructor(private hookshot: HookshotGithubApiService, private scalar: ScalarClientApiService, private sanitizer: DomSanitizer, public translate: TranslateService) {
        super("hookshot_github", translate);
        this.translate = translate;
    }

    public ngOnInit() {
        super.ngOnInit();

        this.loadingConnections = true;
        this.tryLoadOrgs();
    }

    private tryLoadOrgs() {
        this.hookshot.getOrgs().then(r => {
            this.authUrl = null;

            if (r.length <= 0) {
                this.hookshot.getAuthUrls().then(urls => {
                    console.log(urls);
                    this.orgAuthUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urls.orgUrl);
                    this.loadingConnections = false;
                    this.timerId = setTimeout(() => {
                        this.tryLoadOrgs();
                    }, 1000);
                });
                return;
            }

            this.orgs = r.map(o => o.name);
            this.orgId = this.orgs[0];
            this.orgAuthUrl = null;
            this.loadRepos();

            if (this.timerId) {
                clearTimeout(this.timerId);
            }
        }).catch(e => {
            if (e.status === 403 && e.error.dim_errcode === "T2B_NOT_LOGGED_IN") {
                this.hookshot.getAuthUrls().then(urls => {
                    this.authUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urls.userUrl);
                    this.loadingConnections = false;
                    this.timerId = setTimeout(() => {
                        this.tryLoadOrgs();
                    }, 1000);
                });
            } else {
                console.error(e);
                this.translate.get('Error getting Github information').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            }
        });
    }

    public loadRepos() {
        this.isBusy = true;
        this.hookshot.getRepos(this.orgId).then(repos => {
            this.repos = repos.map(r => r.name);
            this.repoId = this.repos[0];

            if (this.isBridged) {
                const conn = this.bridge.config.connections[0].config;
                this.bridgedRepoSlug = `${conn.org}/${conn.repo}`;
            }

            this.isBusy = false;
            this.loadingConnections = false;
        }).catch(e => {
            console.error(e);
            this.isBusy = false;
            this.translate.get('Error getting Github information').subscribe((res: string) => {
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

        this.hookshot.bridgeRoom(this.roomId, this.orgId, this.repoId).then(conn => {
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
