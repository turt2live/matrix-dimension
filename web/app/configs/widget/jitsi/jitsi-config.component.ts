import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarClientApiService } from "../../../shared/services/scalar-client-api.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { EditableWidget, WIDGET_JITSI } from "../../../shared/models/widget";
import { JitsiWidgetIntegration } from "../../../shared/models/legacyintegration";
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
                scalarService: ScalarClientApiService,
                window: Window) {
        super(
            window,
            toaster,
            scalarService,
            dialog.context.roomId,
            dialog.context.integration,
            dialog.context.integrationId,
            WIDGET_JITSI,
            "Jitsi Video Conference",
            "" // we intentionally don't specify the wrapper so we can control the behaviour
        );

        this.integration = <JitsiWidgetIntegration>dialog.context.integration;
    }

    protected onNewWidgetPrepared() {
        this.newWidget.dimension.newData.conferenceId = this.generateConferenceId();
        this.newWidget.dimension.newData.domain = this.integration.jitsiDomain;
        this.newWidget.dimension.newData.isAudioConf = false;
    }

    protected onWidgetsDiscovered() {
        for (const widget of this.widgets) {
            const parsedUrl = url.parse(widget.url, true);
            const conferenceId = parsedUrl.query["conferenceId"];
            const confId = parsedUrl.query["confId"];
            const domain = parsedUrl.query["domain"];
            let isAudioConf = parsedUrl.query["isAudioConf"];

            // Convert isAudioConf to boolean
            if (isAudioConf === "true") isAudioConf = true;
            else if (isAudioConf === "false") isAudioConf = false;
            else if (isAudioConf && isAudioConf[0] === '$') isAudioConf = widget.data[isAudioConf];
            else isAudioConf = false; // default

            if (conferenceId) {
                // It's a legacy Dimension widget
                widget.data.conferenceId = conferenceId;
            } else widget.data.conferenceId = confId;

            if (domain) widget.data.domain = domain;
            else widget.data.domain = "jitsi.riot.im";

            widget.data.isAudioConf = isAudioConf;

            if (!widget.data.conferenceUrl) {
                widget.data.conferenceUrl = "https://" + widget.data.domain + "/" + widget.data.conferenceId;
            }
        }
    }

    protected onWidgetPreparedForEdit(widget: EditableWidget) {
        if (!widget.dimension.newData.conferenceUrl) {
            const conferenceId = widget.dimension.newData.conferenceId;
            const domain = widget.dimension.newData.domain;
            widget.dimension.newData.conferenceUrl = "https://" + domain + "/" + conferenceId;
        }
    }

    public validateAndAddWidget() {
        if (!this.newWidget.dimension.newData.conferenceId) {
            this.toaster.pop("warning", "Please enter a conference name");
            return;
        }

        this.setJitsiUrl(this.newWidget);
        this.addWidget();
    }

    public validateAndSaveWidget(widget: EditableWidget) {
        if (!widget.dimension.newData.conferenceUrl) {
            this.toaster.pop("warning", "Please enter a conference URL");
            return;
        }

        const jitsiUrl = url.parse(widget.dimension.newData.conferenceUrl);
        widget.dimension.newData.domain = jitsiUrl.host;
        widget.dimension.newData.conferenceId = jitsiUrl.path.substring(1);
        widget.dimension.newData.isAudioConf = false;

        this.setJitsiUrl(widget);
        this.saveWidget(widget);
    }

    private setJitsiUrl(widget: EditableWidget) {
        const conferenceId = widget.dimension.newData.conferenceId;
        const domain = widget.dimension.newData.domain;
        const isAudioConf = widget.dimension.newData.isAudioConf;

        let widgetQueryString = url.format({
            query: {
                // TODO: Use templating when mobile riot supports it
                "confId": conferenceId, // named confId for compatibility with mobile clients
                "domain": domain,
                "isAudioConf": isAudioConf,
                "displayName": "$matrix_display_name",
                "avatarUrl": "$matrix_avatar_url",
                "userId": "$matrix_user_id",
            },
        });
        widgetQueryString = this.decodeParams(widgetQueryString, Object.keys(widget.dimension.newData).map(k => "$" + k));

        widget.dimension.newUrl = window.location.origin + "/widgets/jitsi" + widgetQueryString;
        widget.dimension.newData.conferenceUrl = "https://" + domain + "/" + conferenceId;
    }

    private generateConferenceId() {
        return goby.generate(["adj", "pre", "suf"]);
    }
}
