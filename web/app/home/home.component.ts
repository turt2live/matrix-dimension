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
        `"integrations_widgets_urls": ["${this.hostname}/widgets"],\n`;

    public downloadInstructions = "" +
        "# Download Dimension\n" +
        "git clone https://github.com/turt2live/matrix-dimension.git\n" +
        "cd matrix-dimension\n" +
        "\n" +
        "# Edit the configuration to your needs\n" +
        "# Be sure to add yourself as an admin!\n" +
        "cp config/default.yaml config/production.yaml\n" +
        "nano config/production.yaml\n" +
        "\n" +
        "# Run\n" +
        "NODE_ENV=production npm run start:app";

    constructor() {
        // Do stuff
    }

}
