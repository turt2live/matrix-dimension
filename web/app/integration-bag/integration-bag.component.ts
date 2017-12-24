import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { FE_Integration } from "../shared/models/integration";

@Component({
    selector: "my-integration-bag",
    templateUrl: "./integration-bag.component.html",
    styleUrls: ["./integration-bag.component.scss"],
})
export class IntegrationBagComponent {

    @Input() integrations: FE_Integration[];
    @Output() integrationClicked: EventEmitter<FE_Integration> = new EventEmitter<FE_Integration>();

    constructor(private sanitizer: DomSanitizer) {
    }

    public getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    public onClick(integration: FE_Integration) {
        this.integrationClicked.emit(integration);
    }
}
