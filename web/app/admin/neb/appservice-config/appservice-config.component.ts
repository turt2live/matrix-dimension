import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { FE_Appservice, FE_NebConfiguration } from "../../../shared/models/admin-responses";
import { AdminAppserviceApiService } from "../../../shared/services/admin/admin-appservice-api.service";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { TranslateService } from "@ngx-translate/core";

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

    constructor(public dialog: DialogRef<AppserviceConfigDialogContext>,
                private adminAppserviceApi: AdminAppserviceApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
        this.neb = dialog.context.neb;

        this.adminAppserviceApi.getAppservice(this.neb.appserviceId).then(appservice => {
            this.appservice = appservice;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.translate.get('Could not load appservice configuration').subscribe((res: string) => {this.toaster.pop("error", res); });
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
            this.translate.get('The appservice appears to be correctly set up').subscribe((res: string) => {this.toaster.pop("success", res); });
        }).catch(err => {
            console.error(err);
            this.translate.get('The appservice is not correctly set up').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
