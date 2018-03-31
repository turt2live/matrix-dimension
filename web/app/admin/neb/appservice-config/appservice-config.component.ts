import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { FE_Appservice, FE_NebConfiguration } from "../../../shared/models/admin-responses";
import { AdminAppserviceApiService } from "../../../shared/services/admin/admin-appservice-api.service";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";

export class AppserviceConfigDialogContext extends BSModalContext {
    public neb: FE_NebConfiguration;
}

@Component({
    templateUrl: "./appservice-config.component.html",
    styleUrls: ["./appservice-config.component.scss"],
})
export class AdminNebAppserviceConfigComponent implements ModalComponent<AppserviceConfigDialogContext> {

    public isLoading = true;
    public neb: FE_NebConfiguration;
    public appservice: FE_Appservice;

    constructor(public dialog: DialogRef<AppserviceConfigDialogContext>, private adminAppserviceApi: AdminAppserviceApiService, private toaster: ToasterService) {
        this.neb = dialog.context.neb;

        this.adminAppserviceApi.getAppservice(this.neb.appserviceId).then(appservice => {
            this.appservice = appservice;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Could not load appservice configuration");
        });
    }

    public get appserviceConfig(): string {
        return `` +
            `id: ${this.appservice.id}\n` +
            `url: ${window.location.origin}/_matrix/appservice/r0\n` +
            `as_token: ${this.appservice.asToken}\n` +
            `hs_token: ${this.appservice.hsToken}\n` +
            `sender_localpart: ${this.appservice.userPrefix}\n` +
            `namespaces:\n` +
            `  users:\n` +
            `    - exclusive: true\n` +
            `      regex: '@${this.appservice.userPrefix}.*'\n` +
            `  aliases: []\n` +
            `  rooms: []`;
    }

    public test() {
        this.adminAppserviceApi.test(this.neb.appserviceId).then(() => {
            this.toaster.pop("success", "The appservice appears to be correctly set up");
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "The appservice is not correctly set up");
        });
    }
}
