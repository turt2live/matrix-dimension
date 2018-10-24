import { Component, OnInit } from "@angular/core";
import { FE_UserStickerPack } from "../../shared/models/integration";
import { StickerApiService } from "../../shared/services/integrations/sticker-api.service";
import { ToasterService } from "angular2-toaster";
import { MediaService } from "../../shared/services/media.service";
import { ScalarClientApiService } from "../../shared/services/scalar/scalar-client-api.service";
import { WIDGET_STICKER_PICKER } from "../../shared/models/widget";

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
                private scalarClient: ScalarClientApiService,
                private toaster: ToasterService,
                private window: Window) {
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

            if (this.packs.filter(p => p.isSelected).length > 0) this.addWidget();
        }).catch(err => {
            console.error(err);
            pack.isSelected = !pack.isSelected; // revert change
            this.isUpdating = false;
            this.toaster.pop("error", "Error updating stickers");
        });
    }

    private async addWidget() {
        try {
            const widgets = await this.scalarClient.getWidgets();
            const stickerPicker = widgets.response.find(w => w.content && w.content.type === "m.stickerpicker");
            const widgetId = stickerPicker ? ((<any>stickerPicker).id || stickerPicker.state_key) : "dimension-stickerpicker-" + (new Date().getTime());

            console.log("Force-setting new widget of ID " + widgetId);
            await this.scalarClient.setUserWidget({
                id: widgetId,
                type: WIDGET_STICKER_PICKER[0],
                url: this.window.location.origin + "/widgets/stickerpicker",
                data: {
                    dimension: {
                        wrapperId: "stickerpicker",
                    },
                },
            });
        } catch (e) {
            console.error("Failed to check for Dimension sticker picker");
            console.error(e);
        }
    }
}