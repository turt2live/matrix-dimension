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
import { TranslateService } from "@ngx-translate/core";


@Component({
    templateUrl: "./add-selfhosted.component.html",
    styleUrls: ["./add-selfhosted.component.scss"],
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
                private modal: Modal,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public save(): void {
        this.isSaving = true;
        this.asApi.createAppservice(this.userPrefix).then(appservice => {
            return this.nebApi.newAppserviceConfiguration(this.adminUrl, appservice);
        }).then(neb => {
            this.translate.get('New go-neb created').subscribe((res: string) => {this.toaster.pop("success", res); });
            this.modal.open(AdminNebAppserviceConfigComponent, overlayConfigFactory({
                neb: neb,

                isBlocking: true,
                size: 'lg',
            }, AppserviceConfigDialogContext)).result.then(() => this.router.navigate(["../.."], {relativeTo: this.activatedRoute}));
        }).catch(err => {
            console.error(err);
            this.isSaving = false;
            this.translate.get('Error creating appservice').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
