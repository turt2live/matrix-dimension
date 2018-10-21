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

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        widget.dimension.newData.curl = "";
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setGrafanaUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setGrafanaUrl(widget);
    }

    private setGrafanaUrl(widget: EditableWidget) {
        if (!widget.dimension.newData.curl || widget.dimension.newData.curl.trim().length === 0) {
            throw new Error("Please enter a Grafana URL");
        }

        if (widget.dimension.newData.curl.indexOf("&kiosk") === -1) {
            widget.dimension.newData.curl += "&kiosk";
        }
        widget.dimension.newUrl = widget.dimension.newData.curl;
    }
}