import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { WidgetApiService } from "../../shared/services/integrations/widget-api.service";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";

@Component({
    selector: "my-generic-widget-wrapper",
    templateUrl: "generic.component.html",
    styleUrls: ["generic.component.scss"],
})
export class GenericWidgetWrapperComponent {

    public isLoading = true;
    public canEmbed = false;
    public embedUrl: SafeUrl = null;

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
}
