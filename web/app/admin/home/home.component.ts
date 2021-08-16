import { Component } from "@angular/core";
import { AdminApiService } from "../../shared/services/admin/admin-api.service";
import { FE_DimensionConfig } from "../../shared/models/admin-responses";
import { ToasterService } from "angular2-toaster";
import {
    AdminLogoutConfirmationDialogComponent,
} from "./logout-confirmation/logout-confirmation.component";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class AdminHomeComponent {

    public isLoading = true;
    public config: FE_DimensionConfig;

    constructor(private adminApi: AdminApiService,
                private toaster: ToasterService,
                private modal: NgbModal,
                public translate: TranslateService) {
        this.translate = translate;
        adminApi.getConfig().then(config => {
            this.config = config;
            this.isLoading = false;
        });
    }

    public logoutAll(): void {
        const selfhostedRef = this.modal.open(AdminLogoutConfirmationDialogComponent, {
            backdrop: 'static'
        });
        selfhostedRef.result.then(async () => {
            try {
                await this.adminApi.logoutAll();
                this.translate.get('Everyone has been logged out').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.config.sessionInfo.numTokens = 0;
            } catch (err) {
                console.error(err);
                this.translate.get('Error logging everyone out').subscribe((res: string) => {this.toaster.pop("error", res); });
            }
        });
    }
}
