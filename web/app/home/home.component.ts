import { Component } from "@angular/core";

@Component({
    selector: "my-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class HomeComponent {

    public hostname: string = window.location.origin;
    public showPromoPage = this.hostname === "https://dimension.t2bot.io";

    public integrationsConfig = `` +
        `"integrations_ui_url": "${this.hostname}/riot",\n` +
        `"integrations_rest_url": "${this.hostname}/api/v1/scalar",\n` +
        `"integrations_widgets_urls": ["${this.hostname}/widgets"],\n` +
        `"integrations_jitsi_widget_url": "${this.hostname}/widgets/jitsi",\n`;

    constructor() {
        // Do stuff
    }

}
