import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { CapableWidget, WIDGET_API_VERSION_OPENID } from "../capable-widget";
import { ActivatedRoute } from "@angular/router";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-reauth-example-widget-wrapper",
    templateUrl: "manager-test.component.html",
    styleUrls: ["manager-test.component.scss"],
})
export class ManagerTestWidgetWrapperComponent
    extends CapableWidget
    implements OnInit, OnDestroy {
    public readonly STATE_NEUTRAL = "neutral";
    public readonly STATE_OK = "ok";
    public readonly STATE_ERROR = "error";

    public isBusy = true;
    public isSupported = true;
    public selfState = this.STATE_NEUTRAL;
    public managerState = this.STATE_NEUTRAL;
    public homeserverState = this.STATE_NEUTRAL;
    public message: string;

    constructor(
        activatedRoute: ActivatedRoute,
        private scalarApi: ScalarServerApiService,
        private changeDetector: ChangeDetectorRef,
        public translate: TranslateService
    ) {
        super();
        this.translate = translate;
        this.translate
            .get(
                "Click the button to test your connection. This may cause your client to ask if it is okay to share your identity with the widget - this is required to test your connection to your homeserver."
            )
            .subscribe((res: string) => {
                this.message = res;
            });
        const params: any = activatedRoute.snapshot.queryParams;
        ScalarWidgetApi.widgetId = params.widgetId;
    }

    protected onSupportedVersionsFound(): void {
        super.onSupportedVersionsFound();
        this.isSupported = this.doesSupportAtLeastVersion(
            WIDGET_API_VERSION_OPENID
        );
        this.isBusy = false;
        if (!this.isSupported) {
            this.selfState = this.STATE_ERROR;
        }
        this.changeDetector.detectChanges();
    }

    public async start(): Promise<any> {
        this.selfState = this.STATE_NEUTRAL;
        this.managerState = this.STATE_NEUTRAL;
        this.homeserverState = this.STATE_NEUTRAL;
        this.translate
            .get("Please accept the prompt to verify your identity.")
            .subscribe((res: string) => {
                this.message = res;
            });
        this.isBusy = true;

        const response = await this.getOpenIdInfo();
        if (response.blocked) {
            this.isBusy = false;
            this.selfState = this.STATE_ERROR;
            this.translate
                .get("You have blocked this widget from verifying your identity.")
                .subscribe((res: string) => {
                    this.message = res;
                });
            return;
        }

        this.selfState = this.STATE_OK;
        this.translate
            .get("Checking connectivity to integration manager...")
            .subscribe((res: string) => {
                this.message = res;
            });

        try {
            await this.scalarApi.ping();
            this.managerState = this.STATE_OK;
            this.translate
                .get("Checking connectivity to homeserver...")
                .subscribe((res: string) => {
                    this.message = res;
                });
        } catch (e) {
            console.error(e);
            this.isBusy = false;
            this.managerState = this.STATE_ERROR;
            this.translate
                .get(
                    "Error checking if the integration manager is alive. This usually means that the manager which served this widget has gone offline."
                )
                .subscribe((res: string) => {
                    this.message = res;
                });
            return;
        }

        try {
            await this.scalarApi.register(response.openId);
            this.homeserverState = this.STATE_OK;
            this.translate
                .get("You're all set! Click the button below to re-run the test.")
                .subscribe((res: string) => {
                    this.message = res;
                });
            this.isBusy = false;
        } catch (e) {
            this.isBusy = false;
            this.homeserverState = this.STATE_ERROR;
            this.translate
                .get(
                    "Error contacting homeserver. This usually means your federation setup is incorrect, or your homeserver is offline. Consult your homeserver's documentation for how to set up federation."
                )
                .subscribe((res: string) => {
                    this.message = res;
                });
        }
    }
}
