import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { NebBotConfigurationDialogContext } from "../config-context";
import { AdminNebApiService } from "../../../../shared/services/admin/admin-neb-api.service";
import { FE_NebConfiguration } from "../../../../shared/models/admin-responses";
import { FE_Integration } from "../../../../shared/models/integration";

interface GuggyConfig {
    api_key: string;
}

@Component({
    templateUrl: "./guggy.component.html",
    styleUrls: ["./guggy.component.scss", "../config-dialog.scss"],
})
export class AdminNebGuggyConfigComponent implements ModalComponent<NebBotConfigurationDialogContext>, OnInit {

    public isLoading = true;
    public isUpdating = false;
    public config: GuggyConfig;
    public integration: FE_Integration;
    public neb: FE_NebConfiguration;

    constructor(public dialog: DialogRef<NebBotConfigurationDialogContext>,
                private adminNebApi: AdminNebApiService,
                private toaster: ToasterService) {
        this.neb = dialog.context.neb;
        this.integration = dialog.context.integration;
    }

    public ngOnInit() {
        this.adminNebApi.getIntegrationConfiguration(this.neb.id, this.integration.type).then(config => {
            this.config = config;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Error loading configuration");
        });
    }

    public save() {
        this.isUpdating = true;
        this.adminNebApi.setIntegrationConfiguration(this.neb.id, this.integration.type, this.config).then(() => {
            this.toaster.pop("success", "Configuration updated");
            this.dialog.close();
        }).catch(err => {
            this.isUpdating = false;
            console.error(err);
            this.toaster.pop("error", "Error updating integration");
        });
    }
}
