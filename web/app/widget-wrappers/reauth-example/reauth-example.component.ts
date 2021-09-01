import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { CapableWidget, WIDGET_API_VERSION_OPENID } from "../capable-widget";
import { ActivatedRoute } from "@angular/router";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";
import { SessionStorage } from "../../shared/SessionStorage";
import { FE_ScalarOpenIdRequestBody } from "../../shared/models/scalar-server-responses";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-reauth-example-widget-wrapper",
    templateUrl: "reauth-example.component.html",
    styleUrls: ["reauth-example.component.scss"],
})
export class ReauthExampleWidgetWrapperComponent
    extends CapableWidget
    implements OnInit, OnDestroy {
    public busy = true; // busy until we load supported versions
    public hasOpenId = false;
    public userId: string;
    public blocked = false;
    public error = false;
    public stateMessage: string;

    constructor(
        activatedRoute: ActivatedRoute,
        private scalarApi: ScalarServerApiService,
        private changeDetector: ChangeDetectorRef,
        public translate: TranslateService
    ) {
        super();
        this.translate = translate;
        this.translate
            .get("Checking client version...")
            .subscribe((res: string) => {
                this.stateMessage = res;
            });

        const params: any = activatedRoute.snapshot.queryParams;
        ScalarWidgetApi.widgetId = params.widgetId;
    }

    public get widgetId(): string {
        return ScalarWidgetApi.widgetId;
    }

    protected onSupportedVersionsFound(): void {
        super.onSupportedVersionsFound();
        if (!this.doesSupportAtLeastVersion(WIDGET_API_VERSION_OPENID)) {
            this.busy = true;
            this.error = true;
            this.hasOpenId = false;
            this.blocked = false;
            this.translate
                .get("Your client is too old to use this widget, sorry")
                .subscribe((res: string) => {
                    this.stateMessage = res;
                });
        } else {
            this.busy = false;
            this.error = false;
            this.hasOpenId = false;
            this.blocked = false;
            this.stateMessage = null;
        }
        this.changeDetector.detectChanges();
    }

    public async onReauthStart(): Promise<any> {
        this.busy = true;
        this.error = false;
        this.blocked = false;
        this.hasOpenId = false;
        this.translate
            .get("Please accept the prompt to verify your identity")
            .subscribe((res: string) => {
                this.stateMessage = res;
            });

        const response = await this.getOpenIdInfo();
        if (response.blocked) {
            this.busy = false;
            this.blocked = true;
            this.hasOpenId = false;
            this.stateMessage = "";
            return;
        }

        try {
            await this.exchangeOpenIdInfo(response.openId);
        } catch (e) {
            console.error(e);
            this.busy = false;
            this.error = true;
            this.hasOpenId = false;
            this.stateMessage = "";
        }
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
