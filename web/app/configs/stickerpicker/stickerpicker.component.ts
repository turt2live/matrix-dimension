import { Component, OnInit } from "@angular/core";
import { FE_UserStickerPack } from "../../shared/models/integration";
import { StickerApiService } from "../../shared/services/integrations/sticker-api.service";
import { ToasterService } from "angular2-toaster";
import { MediaService } from "../../shared/services/media.service";

@Component({
    templateUrl: "stickerpicker.component.html",
    styleUrls: ["stickerpicker.component.scss"],
})
export class StickerpickerComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public packs: FE_UserStickerPack[];

    constructor(private stickerApi: StickerApiService,
                private media: MediaService,
                private toaster: ToasterService) {
        this.isLoading = true;
        this.isUpdating = false;
    }

    public async ngOnInit() {
        try {
            this.packs = await this.stickerApi.getPacks();
            this.isLoading = false;
        } catch (e) {
            console.error(e);
            this.toaster.pop("error", "Failed to load sticker packs");
        }
    }

    public getThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale" = "scale"): string {
        return this.media.getThumbnailUrl(mxc, width, height, method, true);
    }

    public toggleSelected(pack: FE_UserStickerPack) {
        pack.isSelected = !pack.isSelected;
        this.isUpdating = true;
        this.stickerApi.togglePackSelection(pack.id, pack.isSelected).then(() => {
            this.isUpdating = false;
            this.toaster.pop("success", "Stickers updated");
            // TODO: Add the user widget when we have >1 sticker pack selected
        }).catch(err => {
            console.error(err);
            pack.isSelected = !pack.isSelected; // revert change
            this.isUpdating = false;
            this.toaster.pop("error", "Error updating stickers");
        });
    }
}