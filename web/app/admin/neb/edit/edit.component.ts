import { Component, OnDestroy, OnInit } from "@angular/core";
import { FE_NebConfiguration } from "../../../shared/models/admin-responses";
import { AdminNebApiService } from "../../../shared/services/admin/admin-neb-api.service";
import { ActivatedRoute } from "@angular/router";
import { ToasterService } from "angular2-toaster";
import { FE_Integration } from "../../../shared/models/integration";
import { NEB_HAS_CONFIG, NEB_IS_COMPLEX } from "../../../shared/models/neb";
import { AdminNebGiphyConfigComponent } from "../config/giphy/giphy.component";
import { NebBotConfigurationDialogContext } from "../config/config-context";
import { AdminNebGuggyConfigComponent } from "../config/guggy/guggy.component";
import { AdminNebGoogleConfigComponent } from "../config/google/google.component";
import { AdminNebImgurConfigComponent } from "../config/imgur/imgur.component";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: "./edit.component.html",
    styleUrls: ["./edit.component.scss"],
})
export class AdminEditNebComponent implements OnInit, OnDestroy {

    public isLoading = true;
    public isUpdating = false;
    public isUpstream = false;
    public nebConfig: FE_NebConfiguration;

    private subscription: any;
    private overlappingTypes: string[] = [];

    constructor(private nebApi: AdminNebApiService,
                private route: ActivatedRoute,
                private modal: NgbModal,
                private toaster: ToasterService,
                public translate: TranslateService) {
        this.translate = translate;
    }

    public ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.loadNeb(Number(params["nebId"]));
        });
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public isOverlapping(bot: FE_Integration) {
        return this.overlappingTypes.indexOf(bot.type) !== -1;
    }

    public hasConfig(bot: FE_Integration): boolean {
        return NEB_HAS_CONFIG.indexOf(bot.type) !== -1 && !this.isUpstream;
    }

    public async toggleBot(bot: FE_Integration) {
        bot.isEnabled = !bot.isEnabled;
        this.isUpdating = true;

        try {
            await this.nebApi.toggleIntegration(this.nebConfig.id, bot.type, bot.isEnabled);
            this.isUpdating = false;
            this.translate.get('Integration updated').subscribe((res: string) => {this.toaster.pop("success", res); });
        } catch (err) {
            console.error(err);
            bot.isEnabled = !bot.isEnabled; // revert change
            this.isUpdating = false;
            this.translate.get('Error updating integration').subscribe((res: string) => {this.toaster.pop("error", res); });
            return;
        }

        // Only update the service configuration if
        if (bot.isEnabled && !this.isUpstream) {
            if (this.hasConfig(bot)) {
                this.editBot(bot);
            } else if (NEB_IS_COMPLEX.indexOf(bot.type) === -1) {
                try {
                    await this.nebApi.setIntegrationConfiguration(this.nebConfig.id, bot.type, {});
                } catch (err) {
                    console.error(err);
                    this.translate.get(['Failed to configure the integration', 'Manual troubleshooting may be requred' ]).subscribe((res: string) => {this.toaster.pop("warning", res[0], res[1]); });
                    return;
                }
            }
        }
    }

    public editBot(bot: FE_Integration) {
        let component;

        if (bot.type === "giphy") component = AdminNebGiphyConfigComponent;
        if (bot.type === "guggy") component = AdminNebGuggyConfigComponent;
        if (bot.type === "google") component = AdminNebGoogleConfigComponent;
        if (bot.type === "imgur") component = AdminNebImgurConfigComponent;

        if (!component) throw new Error("No config component for " + bot.type);
        const nebBotRef = this.modal.open(component, {
            backdrop: 'static',
            size: 'lg',
        });
        const nebBotInstance = nebBotRef.componentInstance as NebBotConfigurationDialogContext;
        nebBotInstance.neb = this.nebConfig;
        nebBotInstance.integration = bot;
    }

    private loadNeb(nebId: number) {
        this.isLoading = true;
        this.nebApi.getConfigurations().then(configs => {
            const handledTypes: string[] = [];
            for (const config of configs) {
                if (config.id === nebId) {
                    this.nebConfig = config;
                } else {
                    for (const type of config.integrations) {
                        if (type.isEnabled) handledTypes.push(type.type);
                    }
                }
            }

            this.overlappingTypes = handledTypes;
            this.isUpstream = !!this.nebConfig.upstreamId;
            this.isLoading = false;
        }).catch(err => {
            console.error(err);
            this.translate.get('Could not get go-neb configuration').subscribe((res: string) => {this.toaster.pop('error', res); });
        });
    }
}
