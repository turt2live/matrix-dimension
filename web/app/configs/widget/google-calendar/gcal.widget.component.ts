import { DISABLE_AUTOMATIC_WRAPPING, WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_GOOGLE_CALENDAR } from "../../../shared/models/widget";
import { Component } from "@angular/core";

@Component({
    templateUrl: "gcal.widget.component.html",
    styleUrls: ["gcal.widget.component.scss"],
})
export class GoogleCalendarWidgetConfigComponent extends WidgetComponent {
    constructor() {
        super(WIDGET_GOOGLE_CALENDAR, "Google Calendar", DISABLE_AUTOMATIC_WRAPPING, "googleCalendar");
    }

    protected OnNewWidgetPrepared(widget: EditableWidget) {
        widget.dimension.newData.shareId = "";
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            if (widget.data.dimSrc && !widget.data.src) {
                // Convert legacy Dimension widgets to new source
                widget.data.src = widget.data.dimSrc;
            }
            if (widget.data.src && !widget.data.shareId) {
                // Convert even more legacy Dimension widgets to new source
                widget.data.shareId = widget.data.src;
            }
        }
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setCalendarUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setCalendarUrl(widget);
    }

    private setCalendarUrl(widget: EditableWidget) {
        if (!widget.dimension.newData.shareId || widget.dimension.newData.shareId.trim().length === 0) {
            throw new Error("Please enter a shared calendar ID");
        }

        widget.dimension.newUrl = window.location.origin + "/widgets/gcal?calendarId=$shareId";
    }
}