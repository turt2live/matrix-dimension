import { Component } from "@angular/core";
import { FE_StickerPack } from "../../../shared/models/integration";
import { MediaService } from "../../../shared/services/media.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

export class StickerPackPreviewMoadlInstance {
    public pack: FE_StickerPack;
}

@Component({
    templateUrl: "./preview.component.html",
    styleUrls: ["./preview.component.scss"],
})
export class AdminStickerPackPreviewComponent {

    pack: FE_StickerPack;

    constructor(public modal: NgbActiveModal, private media: MediaService) {

    }

    public getThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale" = "scale"): string {
        return this.media.getThumbnailUrl(mxc, width, height, method, true);
    }
}
