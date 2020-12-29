import { WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_YOUTUBE } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import * as embed from "embed-video";
import * as $ from "jquery";
import * as url from "url";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "youtube.widget.component.html",
    styleUrls: ["youtube.widget.component.scss"],
})
export class YoutubeWidgetConfigComponent extends WidgetComponent {
    constructor(public translate: TranslateService) {
        super(WIDGET_YOUTUBE, "Video", "video", translate,"youtube");
        this.translate = translate;
    }

    protected OnNewWidgetPrepared(widget: EditableWidget) {
        widget.dimension.newData.videoUrl = "";
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]) {
        for (const widget of widgets) {
            if (widget.data.videoUrl) continue; // Dimension widget

            if (widget.data.cUrl) {
                // Scalar widget
                widget.data.videoUrl = this.parseVideoUrl(widget.data.cUrl);
            } else {
                // Older Dimension widget - infer link
                const parsedUrl = url.parse(widget.url, true);
                if (parsedUrl.query["url"]) {
                    widget.data.videoUrl = this.parseVideoUrl(decodeURIComponent(<string>parsedUrl.query["url"]));
                } else console.warn("Cannot parse URL for " + widget.id);
            }
        }
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget) {
        this.setVideoUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setVideoUrl(widget);
    }

    private setVideoUrl(widget: EditableWidget) {
        if (!widget.dimension.newData.videoUrl || widget.dimension.newData.videoUrl.trim().length === 0) {
            this.translate.get('Please enter a video URL').subscribe((res: string) => {throw new Error(res); });
        }

        const videoUrl = this.getRealVideoUrl(widget.dimension.newData.videoUrl);
        if (!videoUrl) {
            this.translate.get('Please enter a YouTube, Vimeo, or DailyMotion video URL').subscribe((res: string) => {throw new Error(res); });
        }

        widget.dimension.newUrl = videoUrl;
    }

    private getRealVideoUrl(videoUrl): string {
        const embedCode = embed(videoUrl);
        if (!embedCode) {
            return null;
        }

        // HACK: Grab the video URL from the iframe embed code
        videoUrl = $(embedCode).attr("src");
        if (videoUrl.startsWith("//")) videoUrl = "https:" + videoUrl;

        return videoUrl;
    }

    private parseVideoUrl(videoUrl: string): string {
        const parsed = url.parse(videoUrl);

        const realPath = parsed.path.split("?")[0];
        if (parsed.host.indexOf("youtube.com") !== -1) {
            return "https://youtube.com/watch?v=" + realPath.substring("/embed/".length);
        } else if (parsed.host.indexOf("vimeo.com") !== -1) {
            return "https://vimeo.com/" + realPath.substring("/video/".length);
        } else if (parsed.host.indexOf("dailymotion.com") !== -1) {
            return "https://dailymotion.com/" + realPath.substring("/embed/".length);
        }

        return videoUrl;
    }
}
