import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as spotifyUri from "spotify-uri";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "my-spotify-widget-wrapper",
    templateUrl: "../fullpage-iframe/fullpage-iframe.component.html",
    styleUrls: ["../fullpage-iframe/fullpage-iframe.component.scss"],
})
export class SpotifyWidgetWrapperComponent {

    public embedUrl: SafeUrl = null;

    constructor(activatedRoute: ActivatedRoute, sanitizer: DomSanitizer) {
        let params: any = activatedRoute.snapshot.queryParams;
        const spotifyUrl = spotifyUri.parse(params.uri);
        const spotifyEmbedUrl = spotifyUri.formatEmbedURL(spotifyUrl);
        this.embedUrl = sanitizer.bypassSecurityTrustResourceUrl(spotifyEmbedUrl);
    }

}
