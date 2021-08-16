import { Component, OnInit } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { FE_StickerPack } from "../../shared/models/integration";
import { AdminStickersApiService } from "../../shared/services/admin/admin-stickers-api-service";
import { AdminStickerPackPreviewComponent, StickerPackPreviewMoadlInstance } from "./preview/preview.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

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
                private modal: NgbModal,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public ngOnInit() {
        this.adminStickers.getAllPacks().then(packs => {
            this.packs = packs;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.translate.get('Failed to load sticker packs').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public toggleEnabled(pack: FE_StickerPack) {
        pack.isEnabled = !pack.isEnabled;
        this.isUpdating = true;
        this.adminStickers.togglePack(pack.id, pack.isEnabled).then(() => {
            this.isUpdating = false;
            this.translate.get('Sticker pack updated').subscribe((res: string) => {this.toaster.pop("success", res); });
        }).catch(err => {
            console.error(err);
            pack.isEnabled = !pack.isEnabled; // revert change
            this.isUpdating = false;
            this.translate.get('Error updating sticker pack').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public previewStickers(pack: FE_StickerPack) {
        const modalRef = this.modal.open(AdminStickerPackPreviewComponent, { size: 'lg' });
        const previewInstance = modalRef.componentInstance as StickerPackPreviewMoadlInstance;

        previewInstance.pack = pack;
    }

    public startTelegramImport() {
        this.isImporting = true;
        this.adminStickers.importFromTelegram(this.tgUrl).then(pack => {
            this.isImporting = false;
            this.tgUrl = "";
            this.packs.push(pack);
            this.translate.get('Telegram sticker pack imported').subscribe((res: string) => {this.toaster.pop("success", res); });
        }).catch(err => {
            console.error(err);
            this.isImporting = false;
            this.translate.get('Error importing sticker pack').subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public removePack(pack: FE_StickerPack) {
        this.isUpdating = true;
        this.adminStickers.removePack(pack.id).then(() => {
            for (let i = 0; i < this.packs.length; ++i) {
                if (this.packs[i].id === pack.id) {
                    this.packs.splice(i, 1);
                    break;
                }
            }
            this.isUpdating = false;
            this.toaster.pop("success", "Sticker pack removed");
        }).catch(err => {
            console.error(err);
            this.isUpdating = false;
            this.toaster.pop("error", "Error removing sticker pack");
        });
    }
}
