import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_JITSI, WIDGET_SCALAR_JITSI } from "../../../shared/models/widget";
import { JitsiWidgetIntegration } from "../../../shared/models/integration";
import * as gobyInit from "goby";
import * as url from "url";

const goby = gobyInit.init({
    // Converts words to a url-safe name
    // Ie: "hello world how-are you" becomes "HelloWorldHowAreYou"
    decorator: parts => parts.map(p => p ? p.split('-').map(p2 => p2 ? p2[0].toUpperCase() + p2.substring(1).toLowerCase() : '').join('') : '').join(''),
});

@Component({
    selector: "my-jitsi-config",
    templateUrl: "jitsi-config.component.html",
    styleUrls: ["jitsi-config.component.scss", "./../../config.component.scss"],
})
export class JitsiWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    public integration: JitsiWidgetIntegration;

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_JITSI,
            WIDGET_SCALAR_JITSI,
            dialog.context.integrationId,
            "Jitsi Video Conference",
            "" // we intentionally don't specify the wrapper so we can control the behaviour
        );

        this.integration = <JitsiWidgetIntegration>dialog.context.integration;
        this.newWidgetName = this.generateConferenceId();
    }

    protected finishParsing(widget: Widget): Widget {
        const parsedUrl = url.parse(widget.url, true);
        const conferenceId = parsedUrl.query["confId"];

        if (!widget.data) widget.data = {};

        if (conferenceId) {
            // It's a scalar widget
            widget.data.dimOriginalConferenceUrl = "https://jitsi.riot.im/" + conferenceId;
            widget.data.dimConferenceUrl = widget.data.dimOriginalConferenceUrl;
        }

        return widget;
    }

    public validateAndAddWidget() {
        const conferenceUrl = "https://" + this.integration.jitsiDomain + "/" + this.newWidgetName;
        const conferenceId = this.newWidgetName;
        const data = {
            dimOriginalConferenceUrl: conferenceUrl,
            dimConferenceUrl: conferenceUrl,
        };

        let widgetQueryString = url.format({
            query: {
                //"scriptUrl": this.integration.scriptUrl, // handled in wrapper
                "domain": this.integration.jitsiDomain,
                "conferenceId": conferenceId,
                "displayName": "$matrix_display_name",
                "avatarUrl": "$matrix_avatar_url",
                "userId": "$matrix_user_id",
            },
        });
        widgetQueryString = this.unformatParams(widgetQueryString, data);

        this.newWidgetUrl = window.location.origin + "/widgets/jitsi" + widgetQueryString;
        this.newWidgetName = "Jitsi Video Conference";
        this.addWidget(data);
    }

    public validateAndSaveWidget(widget: Widget) {
        console.log(widget);
    }

    protected widgetAdded() {
        this.newWidgetName = this.generateConferenceId();
    }

    private generateConferenceId() {
        return goby.generate(["adj", "pre", "suf"]);
    }
}
