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
import { WIDGET_STICKER_PICKER } from "../../shared/models/widget";

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

    constructor(activatedRoute: ActivatedRoute,
                private media: MediaService,
                private scalarApi: ScalarServerApiService,
                private stickerApi: StickerApiService) {
        super();
        this.supportsStickers = true;

        let params: any = activatedRoute.snapshot.queryParams;

        let token = params.scalar_token;
        if (!token) token = localStorage.getItem("dim-scalar-token");
        else localStorage.setItem("dim-scalar-token", token);

        if (!params.widgetId) {
            console.error("No widgetId query parameter");
            this.authError = true;
            this.isLoading = false;
        } else {
            ScalarWidgetApi.widgetId = params.widgetId;
        }

        if (!this.authError) {
            SessionStorage.scalarToken = token;
            this.authError = !token;
            this.isLoading = !this.authError;
        }
    }

    public ngOnInit() {
        super.ngOnInit();
        this.stickerWidgetApiSubscription = ScalarWidgetApi.requestReceived.subscribe(request => {
            if (request.action === "visibility") {
                if ((<any>request).visible) this.loadStickers();
                ScalarWidgetApi.replyAcknowledge(request);
            }
        });
        this.loadStickers();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        if (this.stickerWidgetApiSubscription) this.stickerWidgetApiSubscription.unsubscribe();
    }

    public getThumbnailUrl(mxc: string, width: number, height: number, method: "crop" | "scale" = "scale"): string {
        return this.media.getThumbnailUrl(mxc, width, height, method, true);
    }

    private async loadStickers() {
        if (this.authError) return; // Don't bother

        if (!SessionStorage.userId) {
            try {
                const info = await this.scalarApi.getAccount();
                SessionStorage.userId = info.user_id;
                console.log("Dimension scalar_token belongs to " + SessionStorage.userId);
            } catch (e) {
                console.error(e);
                this.authError = true;
                this.isLoading = false;
                return;
            }
        }

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

    public openIntegrationManager() {
        ScalarWidgetApi.openIntegrationManager(WIDGET_STICKER_PICKER[0], ScalarWidgetApi.widgetId);
    }
}
