import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { FE_StickerPack } from "../../shared/models/integration";
import { AdminStickersApiService } from "../../shared/services/admin/admin-stickers-api-service";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { AdminStickerPackPreviewComponent, StickerPackPreviewDialogContext } from "./preview/preview.component";

@Component({
    templateUrl: "./sticker-packs.component.html",
    styleUrls: ["./sticker-packs.component.scss"],
})
export class AdminStickerPacksComponent implements OnInit {

    public isLoading = true;
    public isUpdating = false;
    public packs: FE_StickerPack[];
    public tgUrl: string;
    public isImporting = false;

    constructor(private adminStickers: AdminStickersApiService,
                private toaster: ToasterService,
                private modal: Modal) {
    }

    public ngOnInit() {
        this.adminStickers.getAllPacks().then(packs => {
            this.packs = packs;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.toaster.pop("error", "Failed to load sticker packs");
        });
    }

    public toggleEnabled(pack: FE_StickerPack) {
        pack.isEnabled = !pack.isEnabled;
        this.isUpdating = true;
        this.adminStickers.togglePack(pack.id, pack.isEnabled).then(() => {
            this.isUpdating = false;
            this.toaster.pop("success", "Sticker pack updated");
        }).catch(err => {
            console.error(err);
            pack.isEnabled = !pack.isEnabled; // revert change
            this.isUpdating = false;
            this.toaster.pop("error", "Error updating sticker pack");
        });
    }

    public previewStickers(pack: FE_StickerPack) {
        this.modal.open(AdminStickerPackPreviewComponent, overlayConfigFactory({
            pack: pack,

            isBlocking: false,
            size: 'lg',
        }, StickerPackPreviewDialogContext));
    }

    public startTelegramImport() {
        this.isImporting = true;
        this.adminStickers.importFromTelegram(this.tgUrl).then(pack => {
            this.isImporting = false;
            this.tgUrl = "";
            this.packs.push(pack);
            this.toaster.pop("success", "Telegram sticker pack imported");
        }).catch(err => {
            console.error(err);
            this.isImporting = false;
            this.toaster.pop("error", "Error importing sticker pack");
        });
    }
}
