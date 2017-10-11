import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "my-video-widget-wrapper",
    templateUrl: "video.component.html",
    styleUrls: ["video.component.scss"],
})
export class VideoWidgetWrapperComponent {

    public embedUrl: SafeUrl = null;

    constructor(activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        let params: any = activatedRoute.snapshot.queryParams;
        this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(params.url);
    }

}
