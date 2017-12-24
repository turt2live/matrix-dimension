import { Component } from "@angular/core";
import { AdminApiService } from "../../../shared/services/admin-api.service";
import { JitsiWidget } from "../../../shared/models/integration";
import { ToasterService } from "angular2-toaster";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetConfigDialogContext } from "../widgets.component";

@Component({
    templateUrl: "./jitsi.component.html",
    styleUrls: ["./jitsi.component.scss", "../config-dialog.scss"],
})
export class AdminWidgetJitsiConfigComponent implements ModalComponent<WidgetConfigDialogContext> {

    public isUpdating = false;
    public widget: JitsiWidget;
    private originalWidget: JitsiWidget;

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
