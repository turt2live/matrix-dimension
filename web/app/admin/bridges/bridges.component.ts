import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { FE_Bridge } from "../../shared/models/integration";
import { AdminIntegrationsApiService } from "../../shared/services/admin/admin-integrations-api.service";

@Component({
    templateUrl: "./bridges.component.html",
    styleUrls: ["./bridges.component.scss"],
})
export class AdminBridgesComponent implements OnInit {

    public isLoading = true;
    public bridges: FE_Bridge<any>[];

    constructor(private adminIntegrations: AdminIntegrationsApiService,
                private toaster: ToasterService) {
    }

    public ngOnInit() {
        this.adminIntegrations.getAllBridges().then(bridges => {
            this.bridges = bridges.filter(b => b.isEnabled);
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Failed to load bridges");
        });
    }
}
