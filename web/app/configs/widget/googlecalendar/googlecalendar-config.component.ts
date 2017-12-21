import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarClientApiService } from "../../../shared/services/scalar-client-api.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { EditableWidget, WIDGET_GOOGLE_CALENDAR } from "../../../shared/models/widget";

@Component({
    selector: "my-googlecalendarwidget-config",
    templateUrl: "googlecalendar-config.component.html",
    styleUrls: ["googlecalendar-config.component.scss", "./../../config.component.scss"],
})
export class GoogleCalendarWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarClientApiService,
                window: Window) {
        super(
            window,
            toaster,
            scalarService,
            dialog.context.roomId,
            dialog.context.integration,
            dialog.context.integrationId,
            WIDGET_GOOGLE_CALENDAR,
            "Google Calendar",
            "", // we intentionally don't specify the wrapper so we can control the behaviour
            "googleCalendar" // scalar wrapper
        );
    }

    protected onWidgetsDiscovered() {
        for (const widget of this.widgets) {
            if (widget.data.dimSrc) {
                // Convert legacy Dimension widgets to use src
                widget.data.src = widget.data.dimSrc;
            }
        }
    }

    public validateAndAddWidget() {
        this.setCalendarUrl(this.newWidget);
        this.addWidget();
    }

    public validateAndSaveWidget(widget: EditableWidget) {
        this.setCalendarUrl(widget);
        this.saveWidget(widget);
    }

    private setCalendarUrl(widget: EditableWidget) {
        const encodedId = encodeURIComponent(widget.dimension.newData.src);
        widget.dimension.newUrl = window.location.origin + "/widget/gcal?calendarId=" + encodedId;
    }
}
