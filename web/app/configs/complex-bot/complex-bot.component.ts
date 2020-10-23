import { OnDestroy, OnInit } from "@angular/core";
import { FE_ComplexBot } from "../../shared/models/integration";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { IntegrationsApiService } from "../../shared/services/integrations/integrations-api.service";
import { ToasterService } from "angular2-toaster";
import { ServiceLocator } from "../../shared/registry/locator.service";
import { ScalarClientApiService } from "../../shared/services/scalar/scalar-client-api.service";
import { TranslateService } from "@ngx-translate/core";

export class ComplexBotComponent<T> implements OnInit, OnDestroy {

    public isLoading = true;
    public isUpdating = false;
    public bot: FE_ComplexBot<T>;
    public newConfig: T;
    public roomId: string;

    private routeQuerySubscription: Subscription;

    protected toaster = ServiceLocator.injector.get(ToasterService);
    protected integrationsApi = ServiceLocator.injector.get(IntegrationsApiService);
    protected route = ServiceLocator.injector.get(ActivatedRoute);
    protected scalarClientApi = ServiceLocator.injector.get(ScalarClientApiService);

    constructor(private integrationType: string, public translate: TranslateService) {
        this.isLoading = true;
        this.isUpdating = false;
    }

    public ngOnInit(): void {
        this.routeQuerySubscription = this.route.queryParams.subscribe(params => {
            this.roomId = params['roomId'];
            this.loadBot();
        });
    }

    public ngOnDestroy(): void {
        if (this.routeQuerySubscription) this.routeQuerySubscription.unsubscribe();
    }

    private loadBot() {
        this.isLoading = true;
        this.isUpdating = false;

        this.newConfig = <T>{};

        this.integrationsApi.getIntegrationInRoom("complex-bot", this.integrationType, this.roomId).then(i => {
            this.bot = <FE_ComplexBot<T>>i;
            this.newConfig = JSON.parse(JSON.stringify(this.bot.config));
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.translate.get("Failed to load configuration").subscribe((res: string) => {this.toaster.pop("error", res); });
        });
    }

    public save(): void {
        this.isUpdating = true;
        this.integrationsApi.setIntegrationConfiguration("complex-bot", this.integrationType, this.roomId, this.newConfig).then(() => {
            this.translate.get("Configuration updated").subscribe((res: string) => {this.toaster.pop("success", res); });
            this.bot.config = this.newConfig;
            this.newConfig = JSON.parse(JSON.stringify(this.bot.config));
            this.isUpdating = false;
        }).catch(err => {
            console.error(err);
            this.translate.get("Error updating configuration").subscribe((res: string) => {this.toaster.pop("error", res); });
            this.isUpdating = false;
        });
    }
}
