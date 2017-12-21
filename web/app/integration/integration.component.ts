import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LegacyIntegration } from "../shared/models/legacyintegration";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

export class ConfigModalContext extends BSModalContext {
    public integration: LegacyIntegration;
    public roomId: string;
    public userId: string;
    public scalarToken: string;
    public integrationId: string;
}

@Component({
    selector: "my-integration",
    templateUrl: "./integration.component.html",
    styleUrls: ["./integration.component.scss"],
})
export class IntegrationComponent {

    @Input() integration: LegacyIntegration;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private sanitizer: DomSanitizer) {
    }

    public getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
