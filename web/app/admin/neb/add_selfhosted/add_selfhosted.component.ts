import { Component } from "@angular/core";
import { AdminAppserviceApiService } from "../../../shared/services/admin/admin-appservice-api.service";
import { AdminNebApiService } from "../../../shared/services/admin/admin-neb-api.service";
import { ToasterService } from "angular2-toaster";
import { ActivatedRoute, Router } from "@angular/router";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import {
    AdminNebAppserviceConfigComponent,
    AppserviceConfigDialogContext
} from "../appservice-config/appservice-config.component";


@Component({
    templateUrl: "./add_selfhosted.component.html",
    styleUrls: ["./add_selfhosted.component.scss"],
})
export class AdminAddSelfhostedNebComponent {

    public isSaving = false;
    public userPrefix = "@_neb";
    public adminUrl = "http://localhost:4050";

    constructor(private asApi: AdminAppserviceApiService,
                private nebApi: AdminNebApiService,
                private toaster: ToasterService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private modal: Modal) {
    }

    public save(): void {
        this.isSaving = true;
        this.asApi.createAppservice(this.userPrefix).then(appservice => {
            return this.nebApi.newAppserviceConfiguration(this.adminUrl, appservice);
        }).then(neb => {
            this.toaster.pop("success", "New go-neb created");

            this.modal.open(AdminNebAppserviceConfigComponent, overlayConfigFactory({
                neb: neb,

                isBlocking: true,
                size: 'lg',
            }, AppserviceConfigDialogContext)).result.then(() => this.router.navigate(["../.."], {relativeTo: this.activatedRoute}));
        }).catch(err => {
            console.error(err);
            this.isSaving = false;
            this.toaster.pop("error", "Error creating appservice");
        });
    }
}
