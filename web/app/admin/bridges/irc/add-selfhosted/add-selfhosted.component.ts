import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminIrcApiService } from "../../../../shared/services/admin/admin-irc-api.service";
import { TranslateService } from "@ngx-translate/core";

export class AddSelfhostedIrcBridgeDialogContext extends BSModalContext {
}

@Component({
    templateUrl: "./add-selfhosted.component.html",
    styleUrls: ["./add-selfhosted.component.scss"],
})
export class AdminIrcBridgeAddSelfhostedComponent implements ModalComponent<AddSelfhostedIrcBridgeDialogContext> {

    public isSaving = false;
    public provisionUrl: string;

    constructor(public dialog: DialogRef<AddSelfhostedIrcBridgeDialogContext>,
                private ircApi: AdminIrcApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        this.ircApi.newSelfhosted(this.provisionUrl).then(() => {
            this.translate.get('IRC Bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
            this.dialog.close();
        }).catch(err => {
            console.error(err);
            this.isSaving = false;
            this.translate.get('Failed to create IRC bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }
}
