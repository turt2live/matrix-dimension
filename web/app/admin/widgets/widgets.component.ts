import { Component } from "@angular/core";
import { AdminApiService } from "../../shared/services/admin-api.service";
import { Widget } from "../../shared/models/integration";
import { ToasterService } from "angular2-toaster";
import { AdminWidgetEtherpadConfigComponent } from "./etherpad/etherpad.component";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminWidgetJitsiConfigComponent } from "./jitsi/jitsi.component";

export class WidgetConfigDialogContext extends BSModalContext {
    public widget: Widget;
}

@Component({
    templateUrl: "./widgets.component.html",
    styleUrls: ["./widgets.component.scss"],
})
export class AdminWidgetsComponent {

    public isLoading = true;
    public isUpdating = false;
    public widgets: Widget[];

    constructor(private adminApi: AdminApiService, private toaster: ToasterService, private modal: Modal) {
        adminApi.getAllIntegrations().then(integrations => {
            this.isLoading = false;
            this.widgets = integrations.widgets;
        });
    }

    public disableWidget(widget: Widget) {
        widget.isEnabled = !widget.isEnabled;
        this.isUpdating = true;
        this.adminApi.toggleIntegration(widget.category, widget.type, widget.isEnabled).then(() => {
            this.isUpdating = false;
            this.toaster.pop("success", "Widget updated");
        }).catch(err => {
            console.error(err);
            widget.isEnabled = !widget.isEnabled; // revert change
            this.isUpdating = false;
            this.toaster.pop("error", "Error updating widget");
        })
    }

    public editWidget(widget: Widget) {
        let component = null;

        if (widget.type === "etherpad") component = AdminWidgetEtherpadConfigComponent;
        if (widget.type === "jitsi") component = AdminWidgetJitsiConfigComponent;

        if (!component) {
            console.error("No known dialog component for " + widget.type);
            this.toaster.pop("error", "Error opening configuration page");
            return;
        }

        this.modal.open(component, overlayConfigFactory({
            widget: widget,

            isBlocking: true,
            size: 'lg',
        }, WidgetConfigDialogContext));
    }

    public hasConfiguration(widget: Widget) {
        // Currently only Jitsi and Etherpad have additional configuration
        return widget.type === "jitsi" || widget.type === "etherpad";
    }
}
