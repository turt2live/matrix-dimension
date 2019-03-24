import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { CapableWidget, WIDGET_API_VERSION_OPENID } from "../capable-widget";
import { ActivatedRoute } from "@angular/router";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";

@Component({
    selector: "my-reauth-example-widget-wrapper",
    templateUrl: "manager-test.component.html",
    styleUrls: ["manager-test.component.scss"],
})
export class ManagerTestWidgetWrapperComponent extends CapableWidget implements OnInit, OnDestroy {

    public readonly STATE_NEUTRAL = 'neutral';
    public readonly STATE_OK = 'ok';
    public readonly STATE_ERROR = 'error';

    public isBusy = true;
    public isSupported = true;
    public selfState = this.STATE_NEUTRAL;
    public managerState = this.STATE_NEUTRAL;
    public homeserverState = this.STATE_NEUTRAL;
    public message = "Click the button to test your connection. This may cause your client to ask if it " +
        "is okay to share your identity with the widget - this is required to test your connection to your " +
        "homeserver.";

    constructor(activatedRoute: ActivatedRoute,
                private scalarApi: ScalarServerApiService,
                private changeDetector: ChangeDetectorRef) {
        super();

        const params: any = activatedRoute.snapshot.queryParams;
        ScalarWidgetApi.widgetId = params.widgetId;
    }

    protected onSupportedVersionsFound(): void {
        super.onSupportedVersionsFound();
        this.isSupported = this.doesSupportAtLeastVersion(WIDGET_API_VERSION_OPENID);
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

        this.message = "Please accept the prompt to verify your identity.";
        this.isBusy = true;

        const response = await this.getOpenIdInfo();
        if (response.blocked) {
            this.isBusy = false;
            this.selfState = this.STATE_ERROR;
            this.message = "You have blocked this widget from verifying your identity.";
            return;
        }

        this.selfState = this.STATE_OK;
        this.message = "Checking connectivity to integration manager...";

        try {
            await this.scalarApi.ping();
            this.managerState = this.STATE_OK;
            this.message = "Checking connectivity to homeserver...";
        } catch (e) {
            console.error(e);
            this.isBusy = false;
            this.managerState = this.STATE_ERROR;
            this.message = "Error checking if the integration manager is alive. This usually means that the manager " +
                "which served this widget has gone offline.";
            return;
        }

        try {
            await this.scalarApi.register(response.openId);
            this.homeserverState = this.STATE_OK;
            this.message = "You're all set! Click the button below to re-run the test.";
            this.isBusy = false;
        } catch (e) {
            this.isBusy = false;
            this.homeserverState = this.STATE_ERROR;
            this.message = "Error contacting homeserver. This usually means your federation setup is incorrect, or " +
                "your homeserver is offline. Consult your homeserver's documentation for how to set up federation.";
        }
    }
}
