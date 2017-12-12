import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "my-gcal-widget-wrapper",
    templateUrl: "gcal.component.html",
    styleUrls: ["gcal.component.scss"],
})
export class GCalWidgetWrapperComponent {

    public embedUrl: SafeUrl = null;

    constructor(activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        let params: any = activatedRoute.snapshot.queryParams;
        const embedUrl = "https://calendar.google.com/calendar/embed?src=" + params.calendarId;
        this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
}
