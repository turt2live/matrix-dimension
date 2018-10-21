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

    protected  OnNewWidgetPrepared(widget: EditableWidget) {
        widget.dimension.newData.src = "";
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            if (widget.data.dimSrc && !widget.data.src) {
                // Convert legacy Dimension widgets to new source
                widget.data.src = widget.data.dimSrc;
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
        if (!widget.dimension.newData.src || widget.dimension.newData.src.trim().length === 0) {
            throw new Error("Please enter a shared calendar ID");
        }

        const encodedId = encodeURIComponent(widget.dimension.newData.src);
        widget.dimension.newUrl = window.location.origin + "/widgets/gcal?calendarId=" + encodedId;
    }
}