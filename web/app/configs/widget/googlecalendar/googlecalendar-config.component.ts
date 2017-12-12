import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_GOOGLE_CALENDAR, WIDGET_SCALAR_GOOGLE_CALENDAR } from "../../../shared/models/widget";

@Component({
    selector: "my-googlecalendarwidget-config",
    templateUrl: "googlecalendar-config.component.html",
    styleUrls: ["googlecalendar-config.component.scss", "./../../config.component.scss"],
})
export class GoogleCalendarWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_GOOGLE_CALENDAR,
            WIDGET_SCALAR_GOOGLE_CALENDAR,
            dialog.context.integration,
            dialog.context.integrationId,
            "Google Calendar",
            "", // we intentionally don't specify the wrapper so we can control the behaviour
            "googleCalendar" // scalar wrapper
        );
    }

    protected finishParsing(widget: Widget) {
        if (!widget.data) widget.data = {};

        if (widget.data.src) {
            // Scalar widget
            widget.data.dimSrc = widget.data.src;
            widget.data.dimOriginalSrc = widget.data.src;
        }

        return widget;
    }

    public validateAndAddWidget() {
        const calendarConfig = this.getCalendarConfig(this.newWidgetUrl);

        this.newWidgetUrl = calendarConfig.url;
        this.addWidget(calendarConfig.data);
    }

    public validateAndSaveWidget(widget: Widget) {
        const calendarConfig = this.getCalendarConfig(this.newWidgetUrl);

        widget.newUrl = calendarConfig.url;
        widget.data = calendarConfig.data;
        this.saveWidget(widget);
    }

    private getCalendarConfig(calendarId: string): { url: string, data: any } {
        return {
            url: window.location.origin + "/widgets/gcal?calendarId=" + encodeURIComponent(calendarId),
            data: {
                dimSrc: calendarId,
                dimOriginalSrc: calendarId,
            },
        };
    }
}
