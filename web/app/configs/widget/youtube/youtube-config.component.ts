import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_YOUTUBE, WIDGET_SCALAR_YOUTUBE } from "../../../shared/models/widget";
import * as embed from "embed-video";
import * as $ from "jquery";

@Component({
    selector: "my-youtubewidget-config",
    templateUrl: "youtube-config.component.html",
    styleUrls: ["youtube-config.component.scss", "./../../config.component.scss"],
})
export class YoutubeWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_YOUTUBE,
            WIDGET_SCALAR_YOUTUBE,
            dialog.context.integrationId,
            "Youtube Widget",
            "video", // wrapper
            "youtube" // scalar wrapper
        );
    }

    public validateAndAddWidget() {
        const url = this.getSafeUrl(this.newWidgetUrl);
        if (!url) {
            this.toaster.pop("warning", "Please enter a YouTube, Vimeo, or DailyMotion video URL");
            return;
        }

        const originalUrl = this.newWidgetUrl;
        this.newWidgetUrl = url;
        this.addWidget({dimOriginalUrl: originalUrl});
    }

    public validateAndSaveWidget(widget: Widget) {
        const url = this.getSafeUrl(widget.newUrl);
        if (!url) {
            this.toaster.pop("warning", "Please enter a YouTube, Vimeo, or DailyMotion video URL");
            return;
        }

        if (!widget.data) widget.data = {};
        widget.data.dimOriginalUrl = widget.newUrl;
        widget.newUrl = url;
        this.saveWidget(widget);
    }

    private getSafeUrl(url) {
        const embedCode = embed(url);
        if (!embedCode) {
            return null;
        }

        // HACK: Grab the video URL from the iframe
        url = $(embedCode).attr("src");
        if (url.startsWith("//")) url = "https:" + url;

        return url;
    }
}
