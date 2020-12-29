import { WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_TWITCH } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "twitch.widget.component.html",
    styleUrls: ["twitch.widget.component.scss"],
})
export class TwitchWidgetConfigComponent extends WidgetComponent {
    constructor(public translate: TranslateService) {
        super(WIDGET_TWITCH, "Twitch Livestream", "video", translate , "twitch");
    }

    protected OnNewWidgetPrepared(widget: EditableWidget) {
        widget.dimension.newData.channelName = "";
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            if (!widget.data.channelName) {
                // Convert legacy Dimension widgets to new format
                widget.data.channelName = widget.data.dimChannelName;
            }
        }
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setTwitchUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setTwitchUrl(widget);
    }

    private setTwitchUrl(widget: EditableWidget) {
        if (!widget.dimension.newData.channelName || widget.dimension.newData.channelName.trim().length === 0) {
            throw new Error("Please enter a channel name");
        }

        widget.dimension.newUrl = "https://player.twitch.tv/?channel=$channelName";
        widget.dimension.newTitle = widget.dimension.newData.channelName;
    }
}
