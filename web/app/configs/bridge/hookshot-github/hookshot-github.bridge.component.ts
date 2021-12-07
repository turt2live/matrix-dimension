import { Component, OnInit } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import {
    FE_HookshotGithubConnection,
    FE_HookshotGithubOrgReposDto,
    FE_HookshotGithubRepo
} from "../../../shared/models/hookshot_github";
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
    public orgEditAuthUrl: SafeUrl;
    public orgAddAuthUrl: SafeUrl;

    public orgs: string[] = [];
    public orgId: string;

    public repos: string[] = [];
    public repoId: string;

    private timerId: any;
    private orgToRepoMap: Record<string, FE_HookshotGithubOrgReposDto>;

    constructor(private hookshot: HookshotGithubApiService, private scalar: ScalarClientApiService, private sanitizer: DomSanitizer, public translate: TranslateService) {
        super("hookshot_github", translate);
        this.translate = translate;
    }

    public ngOnInit() {
        super.ngOnInit();

        this.loadingConnections = true;
        this.tryLoadOrgs();

        this.hookshot.getAuthUrls().then(urls => {
            this.orgAddAuthUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urls.orgUrl);
        });
    }

    private tryOrgAuth() {
        this.hookshot.getAuthUrls().then(urls => {
            this.orgAuthUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urls.orgUrl);
            this.loadingConnections = false;
            this.timerId = setTimeout(() => {
                this.tryLoadOrgs();
            }, 1000);
        });
    }

    private tryLoadOrgs() {
        this.hookshot.getInstalledLocations().then(r => {
            this.authUrl = null;

            if (r.length <= 0) {
                this.tryOrgAuth();
                return;
            }

            this.orgToRepoMap = {};
            for (const orgDto of r) {
                this.orgToRepoMap[orgDto.organization.name] = orgDto;
            }

            this.orgs = Object.keys(this.orgToRepoMap);
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
            } else if (e.status === 400 && e.error.dim_errcode === "T2B_MISSING_AUTH") {
                this.tryOrgAuth();
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

        const dto = this.orgToRepoMap[this.orgId];
        this.repos = dto.repositories.map(r => r.name);
        this.repoId = this.repos[0];
        this.orgEditAuthUrl = dto.changeSelectionUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(dto.changeSelectionUrl) : null;

        if (this.isBridged) {
            const conn = this.bridge.config.connections[0].config;
            this.bridgedRepoSlug = `${conn.org}/${conn.repo}`;
        }

        this.isBusy = false;
        this.loadingConnections = false;
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
