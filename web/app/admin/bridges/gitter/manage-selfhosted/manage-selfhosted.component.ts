import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminGitterApiService } from "../../../../shared/services/admin/admin-gitter-api.service";
import { TranslateService } from "@ngx-translate/core";

export class ManageSelfhostedGitterBridgeDialogContext extends BSModalContext {
    public provisionUrl: string;
    public bridgeId: number;
}

@Component({
    templateUrl: "./manage-selfhosted.component.html",
    styleUrls: ["./manage-selfhosted.component.scss"],
})
export class AdminGitterBridgeManageSelfhostedComponent implements ModalComponent<ManageSelfhostedGitterBridgeDialogContext> {

    public isSaving = false;
    public provisionUrl: string;
    public bridgeId: number;
    public isAdding = false;

    constructor(public dialog: DialogRef<ManageSelfhostedGitterBridgeDialogContext>,
                private gitterApi: AdminGitterApiService,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
        this.provisionUrl = dialog.context.provisionUrl;
        this.bridgeId = dialog.context.bridgeId;
        this.isAdding = !this.bridgeId;
    }

    public add() {
        this.isSaving = true;
        if (this.isAdding) {
            this.gitterApi.newSelfhosted(this.provisionUrl).then(() => {
                this.translate.get('Gitter bridge added').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to create Gitter bridge').subscribe((res: string) => { this.toaster.pop("error", res); });
            });
        } else {
            this.gitterApi.updateSelfhosted(this.bridgeId, this.provisionUrl).then(() => {
                this.translate.get('Gitter bridge updated').subscribe((res: string) => {this.toaster.pop("success", res); });
                this.dialog.close();
            }).catch(err => {
                console.error(err);
                this.isSaving = false;
                this.translate.get('Failed to update Gitter bridge').subscribe((res: string) => {this.toaster.pop("error", res); });
            });
        }
    }
}
