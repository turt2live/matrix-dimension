import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { AdminNebApiService } from "../../../../shared/services/admin/admin-neb-api.service";
import { FE_NebConfiguration } from "../../../../shared/models/admin-responses";
import { FE_Integration } from "../../../../shared/models/integration";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

interface GoogleConfig {
    api_key: string;
    cx: string; // search engine id
}

@Component({
    templateUrl: "./google.component.html",
    styleUrls: ["./google.component.scss", "../config-dialog.scss"],
})
export class AdminNebGoogleConfigComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public config: GoogleConfig;
    public integration: FE_Integration;
    public neb: FE_NebConfiguration;

    constructor(public modal: NgbActiveModal,
                private adminNebApi: AdminNebApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public ngOnInit() {
        this.adminNebApi.getIntegrationConfiguration(this.neb.id, this.integration.type).then(config => {
            this.config = config;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.translate.get('Error loading configuration').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public save() {
        this.isUpdating = true;
        this.adminNebApi.setIntegrationConfiguration(this.neb.id, this.integration.type, this.config).then(() => {
            this.translate.get('Configuration updated').subscribe((res: string) => {this.toaster.pop("success", res); });
            this.modal.close();
        }).catch(err => {
            this.isUpdating = false;
            console.error(err);
            this.translate.get('Error updating integration').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
