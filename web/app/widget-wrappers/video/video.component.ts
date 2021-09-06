import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "my-video-widget-wrapper",
    templateUrl: "../fullpage-iframe/fullpage-iframe.component.html",
    styleUrls: ["../fullpage-iframe/fullpage-iframe.component.scss"],
})
export class VideoWidgetWrapperComponent {
    public embedUrl: SafeUrl = null;

    constructor(activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        const params: any = activatedRoute.snapshot.queryParams;
        this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(params.url);
    }
}
