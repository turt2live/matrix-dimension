import { Component } from "@angular/core";
import { FE_Widget } from "../../shared/models/integration";
import { ToasterService } from "angular2-toaster";
import { AdminWidgetEtherpadConfigComponent } from "./etherpad/etherpad.component";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { AdminWidgetJitsiConfigComponent } from "./jitsi/jitsi.component";
import { AdminIntegrationsApiService } from "../../shared/services/admin/admin-integrations-api.service";
import { AdminWidgetWhiteboardConfigComponent } from "./whiteboard/whiteboard.component";

export class WidgetConfigDialogContext extends BSModalContext {
    public widget: FE_Widget;
}

@Component({
    templateUrl: "./widgets.component.html",
    styleUrls: ["./widgets.component.scss"],
})
export class AdminWidgetsComponent {

    public isLoading = true;
    public isUpdating = false;
    public widgets: FE_Widget[];

    constructor(private adminIntegrationsApi: AdminIntegrationsApiService, private toaster: ToasterService, private modal: Modal) {
        this.adminIntegrationsApi.getAllWidgets().then(widgets => {
            this.isLoading = false;
            this.widgets = widgets;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Failed to load widgets");
        });
    }

    public toggleWidget(widget: FE_Widget) {
        widget.isEnabled = !widget.isEnabled;
        this.isUpdating = true;
        this.adminIntegrationsApi.toggleIntegration(widget.category, widget.type, widget.isEnabled).then(() => {
            this.isUpdating = false;
            this.toaster.pop("success", "Widget updated");
        }).catch(err => {
            console.error(err);
            widget.isEnabled = !widget.isEnabled; // revert change
            this.isUpdating = false;
            this.toaster.pop("error", "Error updating widget");
        });
    }

    public editWidget(widget: FE_Widget) {
        let component = null;

        if (widget.type === "etherpad") component = AdminWidgetEtherpadConfigComponent;
        if (widget.type === "jitsi") component = AdminWidgetJitsiConfigComponent;
        if (widget.type === "whiteboard") component = AdminWidgetWhiteboardConfigComponent;

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

    public hasConfiguration(widget: FE_Widget) {
        // Currently only Jitsi and Etherpad have additional configuration
        return widget.type === "jitsi" || widget.type === "etherpad" || widget.type === "whiteboard";
    }
}
