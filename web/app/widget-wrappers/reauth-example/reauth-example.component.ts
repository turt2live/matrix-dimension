import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { Subscription } from "rxjs";
import { CapableWidget } from "../capable-widget";
import { ActivatedRoute } from "@angular/router";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";
import { SessionStorage } from "../../shared/SessionStorage";
import { FE_ScalarOpenIdRequestBody } from "../../shared/models/scalar-server-responses";

@Component({
    selector: "my-reauth-example-widget-wrapper",
    templateUrl: "reauth-example.component.html",
    styleUrls: ["reauth-example.component.scss"],
})
export class ReauthExampleWidgetWrapperComponent extends CapableWidget implements OnInit, OnDestroy {

    public busy = true; // busy until we load supported versions
    public hasOpenId = false;
    public userId: string;
    public blocked = false;
    public error = false;
    public stateMessage = "Checking client version...";

    private widgetReplySubscription: Subscription;
    private widgetRequestSubscription: Subscription;

    constructor(activatedRoute: ActivatedRoute,
                private scalarApi: ScalarServerApiService,
                private changeDetector: ChangeDetectorRef) {
        super();

        const params: any = activatedRoute.snapshot.queryParams;
        ScalarWidgetApi.widgetId = params.widgetId;
    }

    public get widgetId(): string {
        return ScalarWidgetApi.widgetId;
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.widgetReplySubscription = ScalarWidgetApi.replyReceived.subscribe(async response => {
            const data = response.response;

            if (response.action === "supported_api_versions") {
                if (!data || !data.supported_versions) {
                    this.stateMessage = "Invalid API version response";
                    this.changeDetector.detectChanges();
                    return;
                }

                if (data.supported_versions.indexOf("0.0.2") === -1) {
                    this.stateMessage = "Your client is not supported by this widget.";
                    this.changeDetector.detectChanges();
                    return;
                }

                this.busy = false;
                this.changeDetector.detectChanges();
                return;
            }

            if (response.action !== "get_openid") return;

            try {
                if (data.state === "request") {
                    this.stateMessage = "Waiting for you to accept the prompt...";
                } else if (data.state === "allowed") {
                    await this.exchangeOpenIdInfo(data);
                } else {
                    this.blocked = true;
                    this.busy = false;
                    this.hasOpenId = false;
                    this.stateMessage = null;
                }
            } catch (e) {
                console.error(e);
                this.error = true;
                this.busy = false;
                this.stateMessage = null;
            }

            this.changeDetector.detectChanges();
        });

        this.widgetRequestSubscription = ScalarWidgetApi.requestReceived.subscribe(async request => {
            if (request.action !== "openid_credentials") return;
            ScalarWidgetApi.replyAcknowledge(request);

            try {
                if (request.data.success) {
                    await this.exchangeOpenIdInfo(request.data);
                } else {
                    this.blocked = true;
                    this.busy = false;
                    this.stateMessage = null;
                }
            } catch (e) {
                console.error(e);
                this.error = true;
                this.busy = false;
                this.stateMessage = null;
            }

            this.changeDetector.detectChanges();
        });
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        if (this.widgetReplySubscription) this.widgetReplySubscription.unsubscribe();
        if (this.widgetRequestSubscription) this.widgetRequestSubscription.unsubscribe();
    }

    protected onCapabilitiesSent(): void {
        super.onCapabilitiesSent();

        // Start a request for supported API versions
        ScalarWidgetApi.requestSupportedVersions();
    }

    public onReauthStart(): void {
        this.busy = true;
        this.error = false;
        this.blocked = false;
        this.hasOpenId = false;
        ScalarWidgetApi.requestOpenID();
    }

    private async exchangeOpenIdInfo(openId: FE_ScalarOpenIdRequestBody) {
        this.stateMessage = "Exchanging OpenID credentials for token...";
        this.changeDetector.detectChanges();
        const scalarTokenResp = await this.scalarApi.register(openId);
        SessionStorage.scalarToken = scalarTokenResp.scalar_token;
        const userInfo = await this.scalarApi.getAccount();
        this.hasOpenId = true;
        this.userId = userInfo.user_id;
        this.blocked = false;
        this.busy = false;
        this.stateMessage = null;
    }
}
