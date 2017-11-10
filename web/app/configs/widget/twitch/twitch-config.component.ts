import { Component } from "@angular/core";
import { ModalComponent, DialogRef } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_TWITCH, WIDGET_SCALAR_TWITCH } from "../../../shared/models/widget";

@Component({
    selector: "my-twitchwidget-config",
    templateUrl: "twitch-config.component.html",
    styleUrls: ["twitch-config.component.scss", "./../../config.component.scss"],
})
export class TwitchWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_TWITCH,
            WIDGET_SCALAR_TWITCH,
            dialog.context.integrationId,
            "Twitch Widget",
            "video", // wrapper
            "twitch" // scalar wrapper
        );
    }

    public validateAndAddWidget() {
        // Replace channel name with path to embedable Twitch Player
        const url = "https://player.twitch.tv/?channel="+this.newWidgetUrl;

        // TODO Somehow Validate if it is a valid Username
        if (!url) {
            this.toaster.pop("warning", "Please enter a Twitch Livestream Channel Name");
            return;
        }

        const originalUrl = this.newWidgetUrl;
        this.newWidgetUrl = url;
        this.addWidget({dimChannelName: originalUrl});
    }

    public validateAndSaveWidget(widget: Widget) {
        const url = "https://player.twitch.tv/?channel="+widget.data.dimChannelName;

	// TODO Somehow Validate if it is a valid Username
        if (!url) {
            this.toaster.pop("warning", "Please enter a Twitch Livestream Channel Name");
            return;
        }

        if (!widget.data) widget.data = {};

        widget.newUrl = url;
        widget.data.dimChannelName = widget.data.newDimChannelName;
        this.saveWidget(widget);
    }

    editWidget(widget: Widget) {
        widget.data.newDimChannelName = widget.data.dimChannelName;
        super.editWidget(widget);
    }

}
