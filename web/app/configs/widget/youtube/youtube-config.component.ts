import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarClientApiService } from "../../../shared/services/scalar-client-api.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { EditableWidget, WIDGET_YOUTUBE } from "../../../shared/models/widget";
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
                scalarService: ScalarClientApiService,
                window: Window) {
        super(
            window,
            toaster,
            scalarService,
            dialog.context.roomId,
            dialog.context.integration,
            dialog.context.integrationId,
            WIDGET_YOUTUBE,
            "Youtube Widget",
            "video", // wrapper
            "youtube" // scalar wrapper
        );
    }

    public validateAndAddWidget() {
        const url = this.getRealVideoUrl(this.newWidget.dimension.newUrl);
        if (!url) {
            this.toaster.pop("warning", "Please enter a YouTube, Vimeo, or DailyMotion video URL");
            return;
        }

        this.newWidget.dimension.newUrl = url;
        this.addWidget();
    }

    public validateAndSaveWidget(widget: EditableWidget) {
        const url = this.getRealVideoUrl(widget.dimension.newUrl);
        if (!url) {
            this.toaster.pop("warning", "Please enter a YouTube, Vimeo, or DailyMotion video URL");
            return;
        }

        widget.dimension.newUrl = url;
        this.saveWidget(widget);
    }

    private getRealVideoUrl(url) {
        const embedCode = embed(url);
        if (!embedCode) {
            return null;
        }

        // HACK: Grab the video URL from the iframe embed code
        url = $(embedCode).attr("src");
        if (url.startsWith("//")) url = "https:" + url;

        return url;
    }
}
