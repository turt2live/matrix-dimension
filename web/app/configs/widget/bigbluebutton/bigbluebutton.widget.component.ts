import { WidgetComponent, DISABLE_AUTOMATIC_WRAPPING } from "../widget.component";
import { WIDGET_BIGBLUEBUTTON, EditableWidget } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { FE_BigBlueButtonWidget } from "../../../shared/models/integration";
import { SessionStorage } from "../../../shared/SessionStorage";
import * as url from "url";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "bigbluebutton.widget.component.html",
    styleUrls: ["bigbluebutton.widget.component.scss"],
})

// Configuration of BigBlueButton widgets
export class BigBlueButtonConfigComponent extends WidgetComponent {
    private bigBlueButtonWidget: FE_BigBlueButtonWidget = <FE_BigBlueButtonWidget>SessionStorage.editIntegration;

    constructor(public translate: TranslateService) {
        super(WIDGET_BIGBLUEBUTTON, "BigBlueButton Conference", DISABLE_AUTOMATIC_WRAPPING, translate);
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            widget.data.conferenceUrl = this.templateUrl(widget.url, widget.data);
        }
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        widget.dimension.newData["conferenceUrl"] = this.bigBlueButtonWidget.options.conferenceUrl;
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setWidgetOptions(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setWidgetOptions(widget);
    }

    private setWidgetOptions(widget: EditableWidget) {
        widget.dimension.newData.url = widget.dimension.newData.conferenceUrl;

        let widgetQueryString = url.format({
            query: {
                "conferenceUrl": "$conferenceUrl",
                "displayName": "$matrix_display_name",
                "avatarUrl": "$matrix_avatar_url",
                "userId": "$matrix_user_id",
            },
        });
        widgetQueryString = this.decodeParams(widgetQueryString, Object.keys(widget.dimension.newData).map(k => "$" + k));
        widget.dimension.newUrl = window.location.origin + "/widgets/bigbluebutton" + widgetQueryString;
        console.log("URL ended up as:", widget.dimension.newUrl);
    }
}
