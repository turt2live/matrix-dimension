import { WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_GRAFANA } from "../../../shared/models/widget";
import { Component } from "@angular/core";

@Component({
    templateUrl: "grafana.widget.component.html",
    styleUrls: ["grafana.widget.component.scss"],
})
export class GrafanaWidgetConfigComponent extends WidgetComponent {
    constructor() {
        super(WIDGET_GRAFANA, "Grafana", "generic-fullscreen", "grafana");
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            if (widget.data.curl && !widget.data.url) {
                // Convert legacy Dimension widgets to new source
                widget.data.url = widget.data.curl;
            }
        }
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        widget.dimension.newData.url = "";
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setGrafanaUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setGrafanaUrl(widget);
    }

    private setGrafanaUrl(widget: EditableWidget) {
        if (!widget.dimension.newData.url || widget.dimension.newData.url.trim().length === 0) {
            throw new Error("Please enter a Grafana URL");
        }

        if (widget.dimension.newData.url.indexOf("&kiosk") === -1) {
            widget.dimension.newData.url += "&kiosk";
        }
        widget.dimension.newUrl = widget.dimension.newData.url;
    }
}