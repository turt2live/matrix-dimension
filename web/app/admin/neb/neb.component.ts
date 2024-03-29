import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { AdminNebApiService } from "../../shared/services/admin/admin-neb-api.service";
import { AdminUpstreamApiService } from "../../shared/services/admin/admin-upstream-api.service";
import { AdminAppserviceApiService } from "../../shared/services/admin/admin-appservice-api.service";
import { FE_Appservice, FE_NebConfiguration, FE_Upstream } from "../../shared/models/admin-responses";
import { ActivatedRoute, Router } from "@angular/router";
import {
    AdminNebAppserviceConfigComponent,
    AppserviceConfigDialogContext
} from "./appservice-config/appservice-config.component";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: "./neb.component.html",
    styleUrls: ["./neb.component.scss"],
})
export class AdminNebComponent {

    public isLoading = true;
    public isAddingModularNeb = false;
    public hasModularNeb = false;
    public upstreams: FE_Upstream[];
    public appservices: FE_Appservice[];
    public configurations: FE_NebConfiguration[];

    constructor(private nebApi: AdminNebApiService,
        private upstreamApi: AdminUpstreamApiService,
        private appserviceApi: AdminAppserviceApiService,
        private toaster: ToasterService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private modal: NgbModal,
        public translate: TranslateService) {
        this.translate = translate;

        this.reload().then(() => this.isLoading = false).catch(error => {
            console.error(error);
            this.translate.get('Error loading go-neb configuration').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }

    private reload(): Promise<any> {
        return Promise.all([
            this.loadAppservices(),
            this.loadConfigurations(),
            this.loadUpstreams(),
        ]);
    }

    private loadUpstreams(): Promise<any> {
        return this.upstreamApi.getUpstreams().then(upstreams => {
            this.upstreams = upstreams;
        });
    }

    private loadAppservices(): Promise<any> {
        return this.appserviceApi.getAppservices().then(appservices => {
            this.appservices = appservices;
        });
    }

    private loadConfigurations(): Promise<any> {
        return this.nebApi.getConfigurations().then(nebConfigs => {
            this.configurations = nebConfigs;
            this.isLoading = false;

            this.hasModularNeb = false;
            for (const neb of this.configurations) {
                if (neb.upstreamId) {
                    this.hasModularNeb = true;
                    break;
                }
            }
        });
    }

    public showAppserviceConfig(neb: FE_NebConfiguration) {
        const selfhostedRef = this.modal.open(AdminNebAppserviceConfigComponent, {
            backdrop: 'static',
            size: 'lg',
        });
        const selfhostedInstance = selfhostedRef.componentInstance as AppserviceConfigDialogContext;
        selfhostedInstance.neb = neb;
    }

    public getEnabledBotsString(neb: FE_NebConfiguration): string {
        const result = neb.integrations.filter(i => i.isEnabled).map(i => i.displayName).join(", ");
        if (!result) return "None";
        return result;
    }

    public addSelfHostedNeb() {
        this.router.navigate(["new", "selfhosted"], {relativeTo: this.activatedRoute});
    }

    public addModularHostedNeb() {
        this.isAddingModularNeb = true;
        const createNeb = (upstream: FE_Upstream) => {
            return this.nebApi.newUpstreamConfiguration(upstream).then(neb => {
                this.configurations.push(neb);
                this.translate.get(['matrix.org\'s go-neb added', 'Click the pencil icon to enable the bots.']).subscribe((res: string) => {
                    this.toaster.pop("success", res[0], res[1]);
                });
                this.isAddingModularNeb = false;
                this.hasModularNeb = true;
            }).catch(error => {
                console.error(error);
                this.isAddingModularNeb = false;
                this.translate.get('Error adding matrix.org\'s go-neb').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        };

        const vectorUpstreams = this.upstreams.filter(u => u.type === "vector");
        if (vectorUpstreams.length === 0) {
            console.log("Creating default scalar upstream");
            const scalarUrl = "https://scalar.vector.im/api";
            this.upstreamApi.newUpstream("modular", "vector", scalarUrl, scalarUrl).then(upstream => {
                this.upstreams.push(upstream);
                createNeb(upstream);
            }).catch(err => {
                console.error(err);
                this.translate.get('Error creating matrix.org go-neb').subscribe((res: string) => {
                    this.toaster.pop("error", res);
                });
            });
        } else createNeb(vectorUpstreams[0]);
    }
}
