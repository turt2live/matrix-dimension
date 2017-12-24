import { Component } from "@angular/core";
import { AdminApiService } from "../../shared/services/admin-api.service";
import { DimensionConfigResponse } from "../../shared/models/admin_responses";

@Component({
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class AdminHomeComponent {

    public isLoading = true;
    public config: DimensionConfigResponse;

    constructor(adminApi: AdminApiService) {
        adminApi.getConfig().then(config => {
            this.config = config;
            this.isLoading = false;
        });
    }
}
