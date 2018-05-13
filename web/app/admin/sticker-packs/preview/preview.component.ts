import { Component } from "@angular/core";
import { FE_StickerPack } from "../../../shared/models/integration";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { MediaService } from "../../../shared/services/media.service";

export class StickerPackPreviewDialogContext extends BSModalContext {
    public pack: FE_StickerPack;
}

@Component({
    templateUrl: "./preview.component.html",
    styleUrls: ["./preview.component.scss"],
})
export class AdminStickerPackPreviewComponent implements ModalComponent<StickerPackPreviewDialogContext> {

    public pack: FE_StickerPack;

    constructor(public dialog: DialogRef<StickerPackPreviewDialogContext>, private media: MediaService) {
        this.pack = dialog.context.pack;
    }

    public getThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale" = "scale"): string {
        return this.media.getThumbnailUrl(mxc, width, height, method, true);
    }
}
