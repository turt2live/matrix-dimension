import { Component } from "@angular/core";

@Component({
    selector: "my-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class HomeComponent {

    public hostname: string = window.location.origin;
    public integrationsConfig: string = `
    "integrations_ui_url": "${this.hostname}/riot",
    "integrations_rest_url": "${this.hostname}/api/v1/scalar",
    "integrations_widgets_urls": ["${this.hostname}/widgets"],
    `;

    constructor() {
        // Do stuff
    }

}
