import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { WidgetApiService } from "../../shared/services/integrations/widget-api.service";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { Subscription } from "rxjs/Subscription";
import { ScalarToWidgetRequest } from "../../shared/models/scalar-widget-actions";

@Component({
    selector: "my-generic-widget-wrapper",
    templateUrl: "generic.component.html",
    styleUrls: ["generic.component.scss"],
})
export class GenericWidgetWrapperComponent implements OnInit, OnDestroy {

    public isLoading = true;
    public canEmbed = false;
    public embedUrl: SafeUrl = null;

    private widgetApiSubscription: Subscription;

    constructor(widgetApi: WidgetApiService, activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        let params: any = activatedRoute.snapshot.queryParams;

        ScalarWidgetApi.setWidgetId("test");

        widgetApi.isEmbeddable(params.url).then(result => {
            this.canEmbed = result.canEmbed;
            this.isLoading = false;
            this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(params.url);
        }).catch(err => {
            console.error(err);
            this.canEmbed = false;
            this.isLoading = false;
        });
    }

    public ngOnInit() {
        this.widgetApiSubscription = ScalarWidgetApi.requestReceived.subscribe(e => this.onWidgetRequest(e));
    }

    public ngOnDestroy() {
        if (this.widgetApiSubscription) this.widgetApiSubscription.unsubscribe();
    }

    private onWidgetRequest(request: ScalarToWidgetRequest) {
        if (request.action === "capabilities") {
            // Taking of the screenshot is handled elsewhere
            // TODO: Re-enable screenshots via a configuration flag when Riot has better support for them (and move it to an abstract class)
            ScalarWidgetApi.replyCapabilities(request, [/*"m.capability.screenshot"*/]);
        }
    }
}
