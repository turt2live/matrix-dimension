import { Component } from "@angular/core";
import { ApiService } from "../shared/api.service";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "my-widget-wrapper",
    templateUrl: "widget_wrapper.component.html",
    styleUrls: ["widget_wrapper.component.scss"],
})
export class WidgetWrapperComponent {

    public isLoading = true;
    public canEmbed = false;
    public embedUrl: SafeUrl = null;

    constructor(api: ApiService, activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        let params: any = activatedRoute.snapshot.queryParams;

        api.isEmbeddable(params.url).then(result => {
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
