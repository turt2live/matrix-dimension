import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CapableWidget } from "../capable-widget";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { StickerApiService } from "../../shared/services/integrations/sticker-api.service";
import { SessionStorage } from "../../shared/SessionStorage";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";
import { FE_Sticker, FE_UserStickerPack } from "../../shared/models/integration";
import { MediaService } from "../../shared/services/media.service";

@Component({
    selector: "my-generic-widget-wrapper",
    templateUrl: "sticker-picker.component.html",
    styleUrls: ["sticker-picker.component.scss"],
})
export class StickerPickerWidgetWrapperComponent extends CapableWidget implements OnInit, OnDestroy {

    public isLoading = true;
    public authError = false;
    public packs: FE_UserStickerPack[];

    private stickerWidgetApiSubscription: Subscription;

    constructor(private activatedRoute: ActivatedRoute,
                private media: MediaService,
                private scalarApi: ScalarServerApiService,
                private stickerApi: StickerApiService) {
        super();
        this.supportsStickers = true;

        let params: any = activatedRoute.snapshot.queryParams;
        if (!params.widgetId) {
            console.error("No widgetId query parameter");
            this.authError = true;
        } else {
            ScalarWidgetApi.widgetId = params.widgetId;
        }
    }

    public async ngOnInit() {
        super.ngOnInit();
        this.stickerWidgetApiSubscription = ScalarWidgetApi.requestReceived.subscribe(request => {
            if (request.action === "visibility") {
                if ((<any>request).visible) this.loadStickers();
                ScalarWidgetApi.replyAcknowledge(request);
            }
        });

        let params: any = this.activatedRoute.snapshot.queryParams;
        try {
            await this.loadAccount(params.scalar_token);
            localStorage.setItem("dim-scalar-token", params.scalar_token);
        } catch (e) {
            console.error(e);
            try {
                await this.loadAccount(localStorage.getItem("dim-scalar-token"))
            } catch (e2) {
                console.error(e2);
                this.authError = true;
                this.isLoading = false;
            }
        }
        this.loadStickers();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        if (this.stickerWidgetApiSubscription) this.stickerWidgetApiSubscription.unsubscribe();
    }

    public getThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale" = "scale"): string {
        return this.media.getThumbnailUrl(mxc, width, height, method, true);
    }

    private async loadAccount(scalarToken: string) {
        SessionStorage.scalarToken = scalarToken;
        const info = await this.scalarApi.getAccount();
        SessionStorage.userId = info.user_id;
        console.log("Dimension scalar_token belongs to " + SessionStorage.userId);
    }

    private async loadStickers() {
        if (this.authError) return; // Don't bother

        console.log("Attempting to load available stickers...");
        try {
            const packs = await this.stickerApi.getPacks();
            this.packs = packs.filter(p => p.isSelected);
            console.log("User has " + this.packs.length + "/" + packs.length + " sticker packs selected");
            this.isLoading = false;
        } catch (e) {
            console.error(e);
        }
    }

    public sendSticker(sticker: FE_Sticker, pack: FE_UserStickerPack) {
        ScalarWidgetApi.sendSticker(sticker, pack);
    }
}
