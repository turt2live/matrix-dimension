import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { FE_Integration } from "../shared/models/integration";
import { MediaService } from "../shared/services/media.service";

@Component({
    selector: "my-integration-bag",
    templateUrl: "./integration-bag.component.html",
    styleUrls: ["./integration-bag.component.scss"],
})
export class IntegrationBagComponent implements OnChanges {

    @Input() integrations: FE_Integration[];
    @Output() integrationClicked: EventEmitter<FE_Integration> = new EventEmitter<FE_Integration>();

    constructor(private sanitizer: DomSanitizer, private media: MediaService) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        const change: SimpleChange = changes.integrations;

        (<FE_Integration[]>change.currentValue).map(async (i) => {
            if (i.avatarUrl.startsWith("mxc://")) {
                i.avatarUrl = await this.media.getThumbnailUrl(i.avatarUrl, 128, 128, "scale", true);
            }
        });
    }

    public getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    public onClick(integration: FE_Integration) {
        this.integrationClicked.emit(integration);
    }
}
