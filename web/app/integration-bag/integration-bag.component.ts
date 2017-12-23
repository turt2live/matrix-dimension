import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Integration } from "../shared/models/integration";

@Component({
    selector: "my-integration-bag",
    templateUrl: "./integration-bag.component.html",
    styleUrls: ["./integration-bag.component.scss"],
})
export class IntegrationBagComponent {

    @Input() integrations: Integration[];
    @Output() integrationClicked: EventEmitter<Integration> = new EventEmitter<Integration>();

    constructor(private sanitizer: DomSanitizer) {
    }

    public getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    public onClick(integration: Integration) {
        this.integrationClicked.emit(integration);
    }
}
