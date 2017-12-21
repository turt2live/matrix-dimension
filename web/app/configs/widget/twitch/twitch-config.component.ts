import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarClientApiService } from "../../../shared/services/scalar-client-api.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { EditableWidget, WIDGET_TWITCH } from "../../../shared/models/widget";

@Component({
    selector: "my-twitchwidget-config",
    templateUrl: "twitch-config.component.html",
    styleUrls: ["twitch-config.component.scss", "./../../config.component.scss"],
})
export class TwitchWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

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
            WIDGET_TWITCH,
            "Twitch Widget",
            "video", // wrapper
            "twitch" // scalar wrapper
        );
    }

    protected onNewWidgetPrepared() {
        this.newWidget.dimension.newData.channelName = "";
    }

    protected onWidgetsDiscovered() {
        for (const widget of this.widgets) {
            // Convert dimChannelName to channelName
            if (!widget.data.channelName) {
                widget.data.channelName = widget.data.dimChannelName;
            }
        }
    }

    public validateAndAddWidget() {
        if (!this.newWidget.dimension.newData.channelName) {
            this.toaster.pop("warning", "Please enter a Twitch Livestream channel name");
            return;
        }

        this.setTwitchUrl(this.newWidget);
        this.addWidget();
    }

    public validateAndSaveWidget(widget: EditableWidget) {
        if (!widget.dimension.newData.channelName) {
            this.toaster.pop("warning", "Please enter a Twitch Livestream channel name");
            return;
        }

        this.setTwitchUrl(widget);
        this.saveWidget(widget);
    }

    private setTwitchUrl(widget: EditableWidget) {
        // TODO: This should use templating when mobile riot supports it
        widget.dimension.newUrl = "https://player.twitch.tv/?channel=" + widget.dimension.newData.channelName;
    }

}
