import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { AdminNebApiService } from "../../shared/services/admin/admin-neb-api.service";
import { AdminUpstreamApiService } from "../../shared/services/admin/admin-upstream-api.service";
import { AdminAppserviceApiService } from "../../shared/services/admin/admin-appservice-api.service";
import { FE_Appservice, FE_NebConfiguration, FE_Upstream } from "../../shared/models/admin_responses";
import { ActivatedRoute, Router } from "@angular/router";
import {
    AdminNebAppserviceConfigComponent,
    AppserviceConfigDialogContext
} from "./appservice-config/appservice-config.component";
import { Modal, overlayConfigFactory } from "ngx-modialog";

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
                private modal: Modal) {

        this.reload().then(() => this.isLoading = false).catch(error => {
            console.error(error);
            this.toaster.pop("error", "Error loading go-neb configuration");
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
        this.modal.open(AdminNebAppserviceConfigComponent, overlayConfigFactory({
            neb: neb,

            isBlocking: true,
            size: 'lg',
        }, AppserviceConfigDialogContext));
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
            this.nebApi.newUpstreamConfiguration(upstream).then(neb => {
                this.configurations.push(neb);
                this.toaster.pop("success", "matrix.org's go-neb added", "Click the pencil icon to enable the bots.");
                this.isAddingModularNeb = false;
                this.hasModularNeb = true;
            }).catch(error => {
                console.error(error);
                this.isAddingModularNeb = false;
                this.toaster.pop("error", "Error adding matrix.org's go-neb");
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
                this.toaster.pop("error", "Error creating matrix.org go-neb");
            });
        } else createNeb(vectorUpstreams[0]);
    }
}
