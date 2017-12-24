import { DISABLE_AUTOMATIC_WRAPPING, WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_JITSI } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { FE_JitsiWidget } from "../../../shared/models/integration";
import { SessionStorage } from "../../../shared/SessionStorage";
import { NameService } from "../../../shared/services/name.service";
import * as url from "url";

@Component({
    templateUrl: "jitsi.widget.component.html",
    styleUrls: ["jitsi.widget.component.scss"],
})
export class JitsiWidgetConfigComponent extends WidgetComponent {

    private jitsiWidget: FE_JitsiWidget = <FE_JitsiWidget>SessionStorage.editIntegration;

    constructor(private nameService: NameService) {
        super(WIDGET_JITSI, "Jitsi Video Conference", DISABLE_AUTOMATIC_WRAPPING);
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            const templatedUrl = this.templateUrl(widget.url, widget.data);
            const parsedUrl = url.parse(templatedUrl, true);
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
                widget.data.confId = conferenceId;
            } else widget.data.confId = confId;

            if (domain) widget.data.domain = domain;
            else widget.data.domain = "jitsi.riot.im";

            widget.data.isAudioConf = isAudioConf;
            widget.data.conferenceUrl = "https://" + widget.data.domain + "/" + widget.data.confId;
        }
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        const name = this.nameService.getHumanReadableName();

        let rootUrl = "https://jitsi.riot.im/";
        if (this.jitsiWidget.options && this.jitsiWidget.options.jitsiDomain) {
            rootUrl = "https://" + this.jitsiWidget.options.jitsiDomain + "/";
        }

        widget.dimension.newData["conferenceUrl"] = rootUrl + name;
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setJitsiUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setJitsiUrl(widget);
    }

    private setJitsiUrl(widget: EditableWidget) {
        const jitsiUrl = url.parse(widget.dimension.newData.conferenceUrl);
        widget.dimension.newData.domain = jitsiUrl.host;
        widget.dimension.newData.confId = jitsiUrl.path.substring(1);
        widget.dimension.newData.isAudioConf = false;

        let widgetQueryString = url.format({
            query: {
                // TODO: Use templating when mobile riot supports it
                "confId": widget.dimension.newData.confId,
                "domain": widget.dimension.newData.domain,
                "isAudioConf": widget.dimension.newData.isAudioConf,
                "displayName": "$matrix_display_name",
                "avatarUrl": "$matrix_avatar_url",
                "userId": "$matrix_user_id",
            },
        });
        widgetQueryString = this.decodeParams(widgetQueryString, Object.keys(widget.dimension.newData).map(k => "$" + k));

        widget.dimension.newUrl = window.location.origin + "/widgets/jitsi" + widgetQueryString;
    }
}