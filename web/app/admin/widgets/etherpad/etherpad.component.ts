import { Component } from "@angular/core";
import { AdminApiService } from "../../../shared/services/admin-api.service";
import { EtherpadWidget } from "../../../shared/models/integration";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetConfigDialogContext } from "../widgets.component";

@Component({
    templateUrl: "./etherpad.component.html",
    styleUrls: ["./etherpad.component.scss", "../config-dialog.scss"],
})
export class AdminWidgetEtherpadConfigComponent implements ModalComponent<WidgetConfigDialogContext> {

    public isUpdating = false;
    public widget: EtherpadWidget;
    private originalWidget: EtherpadWidget;

    constructor(public dialog: DialogRef<WidgetConfigDialogContext>, private adminApi: AdminApiService, private toaster: ToasterService) {
        this.originalWidget = dialog.context.widget;
        this.widget = JSON.parse(JSON.stringify(this.originalWidget));
    }

    public save() {
        this.isUpdating = true;
        this.adminApi.setWidgetOptions(this.widget.category, this.widget.type, this.widget.options).then(() => {
            this.originalWidget.options = this.widget.options;
            this.toaster.pop("success", "Widget updated");
            this.dialog.close();
        }).catch(err => {
            this.isUpdating = false;
            console.error(err);
            this.toaster.pop("error", "Error updating widget");
        });
    }
}
