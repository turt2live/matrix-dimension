import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "my-generic-fullscreen-widget-wrapper",
    templateUrl: "../fullpage-iframe/fullpage-iframe.component.html",
    styleUrls: ["../fullpage-iframe/fullpage-iframe.component.scss"],
})
export class GenericFullscreenWidgetWrapperComponent {

    public embedUrl: SafeUrl = null;

    constructor(activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        let params: any = activatedRoute.snapshot.queryParams;
        // Note: we don't do an embeddable check (as we would in a generic wrapper)
        // because the Grafana dashboard might be private.
        this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(params.url);
    }
}
