import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "app-gcal-widget-wrapper",
    templateUrl: "../fullpage-iframe/fullpage-iframe.component.html",
    styleUrls: ["../fullpage-iframe/fullpage-iframe.component.scss"],
})
export class GCalWidgetWrapperComponent {
    public embedUrl: SafeUrl = null;

    constructor(activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        const params: any = activatedRoute.snapshot.queryParams;
        const embedUrl =
      "https://calendar.google.com/calendar/embed?src=" + params.calendarId;
        this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
}
