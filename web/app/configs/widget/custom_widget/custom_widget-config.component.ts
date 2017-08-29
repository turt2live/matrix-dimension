import { Component } from "@angular/core";
import { ModalComponent, DialogRef } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_CUSTOM, WIDGET_SCALAR_CUSTOM } from "../../../shared/models/widget";

// TODO: A lot of this can probably be abstracted out for other widgets (even the UI), possibly even for other integrations

@Component({
    selector: "my-customwidget-config",
    templateUrl: "custom_widget-config.component.html",
    styleUrls: ["custom_widget-config.component.scss", "./../../config.component.scss"],
})
export class CustomWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    public isLoading = true;
    public isUpdating = false;
    public widgets: Widget[];
    public widgetUrl = "";

    private toggledWidgets: string[] = [];

    constructor(public dialog: DialogRef<ConfigModalContext>,
                private toaster: ToasterService,
                scalarService: ScalarService) {
        super(scalarService, dialog.context.roomId);

        this.getWidgetsOfType(WIDGET_DIM_CUSTOM, WIDGET_SCALAR_CUSTOM).then(widgets => {
            this.widgets = widgets;
            this.isLoading = false;
            this.isUpdating = false;
        });
    }

    public addWidget() {
        let constructedWidget: Widget = {
            id: "dimension-" + (new Date().getTime()),
            url: this.widgetUrl,
            type: WIDGET_DIM_CUSTOM,
            name: "Custom Widget",
        };

        this.isUpdating = true;
        this.scalarApi.setWidget(this.roomId, constructedWidget)
            .then(() => this.widgets.push(constructedWidget))
            .then(() => {
                this.isUpdating = false;
                this.widgetUrl = "";
                this.toaster.pop("success", "Widget added!");
            })
            .catch(err => {
                this.toaster.pop("error", err.json().error);
                console.error(err);
                this.isUpdating = false;
            });
    }

    public saveWidget(widget: Widget) {
        if (widget.newUrl.trim().length === 0) {
            this.toaster.pop("warning", "Please enter a URL for the widget");
            return;
        }

        widget.name = widget.newName || "Custom Widget";
        widget.url = widget.newUrl;

        this.isUpdating = true;
        this.scalarApi.setWidget(this.roomId, widget)
            .then(() => this.toggleWidget(widget))
            .then(() => {
                this.isUpdating = false;
                this.toaster.pop("success", "Widget updated!");
            })
            .catch(err => {
                this.toaster.pop("error", err.json().error);
                console.error(err);
                this.isUpdating = false;
            });
    }

    public removeWidget(widget: Widget) {
        this.isUpdating = true;
        this.scalarApi.deleteWidget(this.roomId, widget)
            .then(() => this.widgets.splice(this.widgets.indexOf(widget), 1))
            .then(() => {
                this.isUpdating = false;
                this.toaster.pop("success", "Widget deleted!");
            })
            .catch(err => {
                this.toaster.pop("error", err.json().error);
                console.error(err);
                this.isUpdating = false;
            });
    }

    public editWidget(widget: Widget) {
        widget.newName = widget.name || "Custom Widget";
        widget.newUrl = widget.url;
        this.toggleWidget(widget);
    }

    public toggleWidget(widget: Widget) {
        let idx = this.toggledWidgets.indexOf(widget.id);
        if (idx === -1) this.toggledWidgets.push(widget.id);
        else this.toggledWidgets.splice(idx, 1);
    }

    public isWidgetToggled(widget: Widget) {
        return this.toggledWidgets.indexOf(widget.id) !== -1;
    }
}
