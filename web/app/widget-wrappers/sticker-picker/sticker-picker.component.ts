import {
    animate,
    state,
    style,
    transition,
    trigger,
} from "@angular/animations";
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CapableWidget, WIDGET_API_VERSION_OPENID } from "../capable-widget";
import { fromEvent } from "rxjs";
import {
    distinctUntilChanged,
    filter,
    map,
    pairwise,
    share,
    throttleTime,
} from "rxjs/operators";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { StickerApiService } from "../../shared/services/integrations/sticker-api.service";
import { SessionStorage } from "../../shared/SessionStorage";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";
import {
    FE_Sticker,
    FE_UserStickerPack,
} from "../../shared/models/integration";
import { MediaService } from "../../shared/services/media.service";
import { WIDGET_STICKER_PICKER } from "../../shared/models/widget";

@Component({
    selector: "app-generic-widget-wrapper",
    templateUrl: "sticker-picker.component.html",
    styleUrls: ["sticker-picker.component.scss"],
    animations: [
        trigger("hideList", [
            state("hidden", style({ opacity: 0, transform: "translateY(100%)" })),
            state("visible", style({ opacity: 1, transform: "translateY(0)" })),
            transition("* => *", animate("200ms ease-in")),
        ]),
    ],
})
export class StickerPickerWidgetWrapperComponent
    extends CapableWidget
    implements OnInit, OnDestroy, AfterViewInit {
    public isLoading = true;
    public isListVisible = true;
    public authError = false;
    public packs: FE_UserStickerPack[];

    private stickerWidgetApiSubscription: Subscription;

    constructor(
        activatedRoute: ActivatedRoute,
        private media: MediaService,
        private scalarApi: ScalarServerApiService,
        private stickerApi: StickerApiService,
        private changeDetector: ChangeDetectorRef
    ) {
        super();
        this.supportsStickers = true;

        const params: any = activatedRoute.snapshot.queryParams;

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
        this.stickerWidgetApiSubscription =
      ScalarWidgetApi.requestReceived.subscribe((request) => {
          if (request.action === "visibility") {
              if ((<any>request).visible) this.loadStickers();
              ScalarWidgetApi.replyAcknowledge(request);
          }
      });
        this.loadStickers();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        if (this.stickerWidgetApiSubscription)
            this.stickerWidgetApiSubscription.unsubscribe();
    }

    public ngAfterViewInit() {
        const scroll$ = fromEvent(window, "scroll").pipe(
            throttleTime(10),
            map(() => window.pageYOffset),
            pairwise(),
            map(([y1, y2]): string => (y2 < y1 ? "up" : "down")),
            distinctUntilChanged(),
            share()
        );

        const scrollUp$ = scroll$.pipe(filter((direction) => direction === "up"));

        const scrollDown = scroll$.pipe(
            filter((direction) => direction === "down")
        );

        scrollUp$.subscribe(() => (this.isListVisible = true));
        scrollDown.subscribe(() => (this.isListVisible = false));
    }

    protected onSupportedVersionsFound(): void {
        super.onSupportedVersionsFound();

        if (
            this.authError &&
      this.doesSupportAtLeastVersion(WIDGET_API_VERSION_OPENID)
        ) {
            this.isLoading = true;
            this.changeDetector.detectChanges();

            this.getOpenIdInfo().then(async (response) => {
                if (response.blocked) {
                    this.isLoading = false;
                    this.authError = true;
                    this.changeDetector.detectChanges();
                    return;
                }

                try {
                    const registerResponse = await this.scalarApi.register(
                        response.openId
                    );
                    localStorage.setItem(
                        "dim-scalar-token",
                        registerResponse.scalar_token
                    );
                    SessionStorage.scalarToken = registerResponse.scalar_token;
                    this.authError = !SessionStorage.scalarToken;
                    this.isLoading = false;
                    this.loadStickers();
                } catch (e) {
                    console.error(e);
                    this.isLoading = false;
                    this.authError = true;
                }

                this.changeDetector.detectChanges();
            });
        }
    }

    public getThumbnailUrl(
        mxc: string,
        width: number,
        height: number,
        method: "crop" | "scale" = "scale"
    ): string {
        return this.media.getThumbnailUrl(mxc, width, height, method, true);
    }

    private async loadStickers() {
        if (this.authError) return; // Don't bother

        if (!SessionStorage.userId) {
            try {
                const info = await this.scalarApi.getAccount();
                SessionStorage.userId = info.user_id;
                console.log(
                    "Dimension scalar_token belongs to " + SessionStorage.userId
                );
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
            this.packs = packs.filter((p) => p.isSelected);
            console.log(
                "User has " +
          this.packs.length +
          "/" +
          packs.length +
          " sticker packs selected"
            );
            this.isLoading = false;
            this.changeDetector.markForCheck();
        } catch (e) {
            console.error(e);
        }
    }

    public scrollHorizontal(event: WheelEvent): void {
        document.getElementsByClassName("sticker-pack-list")[0].scrollLeft +=
      event.deltaY;
        event.preventDefault();
    }

    public scrollToPack(id: string) {
        const el = document.getElementById(id);
        el.scrollIntoView({ behavior: "smooth" });
    }

    public sendSticker(sticker: FE_Sticker, pack: FE_UserStickerPack) {
        ScalarWidgetApi.sendSticker(sticker, pack);
    }

    public openIntegrationManager() {
        ScalarWidgetApi.openIntegrationManager(
            WIDGET_STICKER_PICKER[0],
            ScalarWidgetApi.widgetId
        );
    }
}
