import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ScalarClientApiService } from "../../shared/services/scalar/scalar-client-api.service";
import * as _ from "lodash";
import { ScalarServerApiService } from "../../shared/services/scalar/scalar-server-api.service";
import { FE_Integration, FE_IntegrationRequirement, FE_SimpleBot } from "../../shared/models/integration";
import { IntegrationsRegistry } from "../../shared/registry/integrations.registry";
import { SessionStorage } from "../../shared/SessionStorage";
import { AdminApiService } from "../../shared/services/admin/admin-api.service";
import { IntegrationsApiService } from "../../shared/services/integrations/integrations-api.service";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { ConfigSimpleBotComponent, SimpleBotConfigDialogContext } from "../../configs/simple-bot/simple-bot.component";
import { ToasterService } from "angular2-toaster";
import { StickerApiService } from "../../shared/services/integrations/sticker-api.service";

const CATEGORY_MAP = {
    "Widgets": ["widget"],
    "Bots": ["complex-bot", "bot"],
    "Bridges": ["bridge"],
};

@Component({
    selector: "my-riot-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class RiotHomeComponent {
    public isLoading = true;
    public isError = false;
    public errorMessage: string;
    public isRoomEncrypted: boolean;
    public hasStickerPacks = false;

    private roomId: string;
    private userId: string;
    private requestedScreen: string = null;
    private requestedIntegrationId: string = null;
    public integrationsForCategory: { [category: string]: FE_Integration[] } = {};
    private categoryMap: { [categoryName: string]: string[] } = CATEGORY_MAP;

    constructor(private activatedRoute: ActivatedRoute,
                private scalarApi: ScalarServerApiService,
                private scalar: ScalarClientApiService,
                private integrationsApi: IntegrationsApiService,
                private stickerApi: StickerApiService,
                private adminApi: AdminApiService,
                private router: Router,
                private modal: Modal,
                private toaster: ToasterService) {
        let params: any = this.activatedRoute.snapshot.queryParams;

        this.requestedScreen = params.screen;
        this.requestedIntegrationId = params.integ_id;

        if (SessionStorage.roomId && SessionStorage.userId) {
            this.roomId = SessionStorage.roomId;
            this.userId = SessionStorage.userId;
            console.log("Already checked scalar token and other params - continuing startup");
            this.prepareIntegrations();
            return;
        }

        if (!params.scalar_token || !params.room_id) {
            console.error("Unable to load Dimension. Missing room ID or scalar token.");
            this.isError = true;
            this.isLoading = false;
            this.errorMessage = "Unable to load Dimension - missing room ID or token.";
        } else {
            this.roomId = params.room_id;
            SessionStorage.scalarToken = params.scalar_token;
            SessionStorage.roomId = this.roomId;

            this.scalarApi.getAccount().then(response => {
                const userId = response.user_id;
                SessionStorage.userId = userId;
                if (!userId) {
                    console.error("No user returned for token. Is the token registered in Dimension?");
                    this.isError = true;
                    this.isLoading = false;
                    this.errorMessage = "Could not verify your token. Please try logging out of Riot and back in. Be sure to back up your encryption keys!";
                } else {
                    this.userId = userId;
                    console.log("Scalar token belongs to " + userId);
                    this.checkAdmin();
                    this.prepareIntegrations();
                }
            }).catch(err => {
                console.error(err);
                this.isError = true;
                this.isLoading = false;
                this.errorMessage = "Unable to communicate with Dimension due to an unknown error.";
            });
        }
    }

    private checkAdmin() {
        this.adminApi.isAdmin().then(() => {
            console.log(SessionStorage.userId + " is an admin for this Dimension instance");
            SessionStorage.isAdmin = true;
        }).catch(() => SessionStorage.isAdmin = false);
    }

    public hasIntegrations(): boolean {
        for (const category of this.getCategories()) {
            if (this.getIntegrationsIn(category).length > 0) return true;
        }

        return false;
    }

    public getCategories(): string[] {
        return Object.keys(this.categoryMap);
    }

    public getIntegrationsIn(category: string): FE_Integration[] {
        return this.integrationsForCategory[category];
    }

    private getIntegrations(): FE_Integration[] {
        const result: FE_Integration[] = [];

        for (const category of this.getCategories()) {
            for (const integration of this.getIntegrationsIn(category)) {
                result.push(integration);
            }
        }

        return result;
    }

    public modifyIntegration(integration: FE_Integration) {
        if (!integration._isSupported) {
            console.log(this.userId + " tried to modify " + integration.displayName + " with error: " + integration._notSupportedReason);
            const reason = integration.category === "widget" ? "You do not appear to have permission to modify widgets in this room" : integration._notSupportedReason;
            this.toaster.pop("error", reason);
            return;
        }

        SessionStorage.editIntegration = integration;
        SessionStorage.editsRequested++;
        console.log(this.userId + " is trying to modify " + integration.displayName);

        if (integration.category === "bot") {
            this.modal.open(ConfigSimpleBotComponent, overlayConfigFactory({
                bot: <FE_SimpleBot>integration,
                roomId: this.roomId,

                isBlocking: true,
                size: 'lg',
            }, SimpleBotConfigDialogContext));
        } else {
            console.log("Navigating to edit screen for " + integration.category + " " + integration.type);
            this.router.navigate(['riot-app', integration.category, integration.type], {queryParams: {roomId: this.roomId}});
        }
    }

    private prepareIntegrations() {
        this.scalar.isRoomEncrypted(this.roomId).then(payload => {
            this.isRoomEncrypted = payload.response;
            return this.integrationsApi.getIntegrations(this.roomId);
        }).then(response => {
            const integrations: FE_Integration[] = _.flatten(Object.keys(response).map(k => response[k]));
            const supportedIntegrations: FE_Integration[] = _.filter(integrations, i => IntegrationsRegistry.isSupported(i));

            // Flag integrations that aren't supported in encrypted rooms
            if (this.isRoomEncrypted) {
                for (const integration of supportedIntegrations) {
                    if (!integration.isEncryptionSupported) {
                        integration._isSupported = false;
                        integration._notSupportedReason = "This integration is not supported in encrypted rooms";
                    }
                }
            }

            // Set up the categories
            for (const category of Object.keys(this.categoryMap)) {
                const supportedTypes = this.categoryMap[category];
                this.integrationsForCategory[category] = _.filter(supportedIntegrations, i => supportedTypes.indexOf(i.category) !== -1);
            }

            let promises = supportedIntegrations.map(i => this.updateIntegrationState(i));
            return Promise.all(promises);
        }).then(() => {
            this.isLoading = false;

            // HACK: We wait for the digest cycle so we actually have components to look at
            setTimeout(() => this.tryOpenConfigScreen(), 20);
        }).catch(err => {
            console.error(err);
            this.isError = true;
            this.isLoading = false;
            this.errorMessage = "Unable to set up Dimension. This version of Riot may not supported or there may be a problem with the server.";
        });

        this.stickerApi.getPacks().then(packs => {
            this.hasStickerPacks = packs.length > 0;
        }).catch(err => {
            console.error(err);
        });
    }

    private tryOpenConfigScreen() {
        let category = null;
        let type = null;
        if (!this.requestedScreen) return;

        if (this.requestedScreen === "type_m.stickerpicker") {
            console.log("Intercepting config screen handling to open sticker picker config");
            this.router.navigate(['riot-app', 'stickerpicker']);
            return;
        }

        const targetIntegration = IntegrationsRegistry.getIntegrationForScreen(this.requestedScreen);
        if (targetIntegration) {
            category = targetIntegration.category;
            type = targetIntegration.type;
        } else {
            console.log("Unknown screen requested: " + this.requestedScreen);
        }

        console.log("Searching for integration for requested screen");
        for (const integration of this.getIntegrations()) {
            if (integration.category === category && integration.type === type) {
                console.log("Configuring integration " + this.requestedIntegrationId + " category=" + category + " type=" + type);
                SessionStorage.editIntegration = integration;
                SessionStorage.editIntegrationId = this.requestedIntegrationId;
                this.modifyIntegration(integration);
                return;
            }
        }

        console.log("Failed to find integration component for category=" + category + " type=" + type);
    }

    private async updateIntegrationState(integration: FE_Integration) {
        if (!integration.requirements) return;

        let promises = integration.requirements.map(r => this.checkRequirement(r));

        if (integration.category === "bot") {
            const state = await this.scalar.getMembershipState(this.roomId, (<FE_SimpleBot>integration).userId);
            if (state && state.response && state.response.membership) {
                integration._inRoom = ["join", "invite"].indexOf(state.response.membership) !== -1;
            } else integration._inRoom = false;
        }

        return Promise.all(promises).then(() => {
            integration._isSupported = true;
            integration._notSupportedReason = null;
        }, error => {
            console.error(error);
            integration._isSupported = false;
            integration._notSupportedReason = error;
        });
    }

    private checkRequirement(requirement: FE_IntegrationRequirement) {
        switch (requirement.condition) {
            case "publicRoom":
                return this.scalar.getJoinRule(this.roomId).then(payload => {
                    if (!payload.response) {
                        return Promise.reject("Could not communicate with Riot");
                    }
                    const isPublic = payload.response.join_rule === "public";
                    if (isPublic !== requirement.expectedValue) {
                        return Promise.reject("The room must be " + (isPublic ? "non-public" : "public") + " to use this integration");
                    } else return Promise.resolve();
                });
            case "canSendEventTypes":
                const processPayload = payload => {
                    const response = <any>payload.response;
                    if (response === true) return Promise.resolve();
                    if (response.error || response.error.message)
                        return Promise.reject("You cannot modify widgets in this room");
                    return Promise.reject("Error communicating with Riot");
                };

                let promiseChain = Promise.resolve();
                requirement.argument.forEach(e => promiseChain = promiseChain.then(() => this.scalar.canSendEvent(this.roomId, e.type, e.isState).then(processPayload).catch(processPayload)));
                return promiseChain.then(() => {
                    if (!requirement.expectedValue) return Promise.reject("Expected to not be able to send specific event types");
                }).catch(err => {
                    console.error(err);
                    if (requirement.expectedValue) return Promise.reject("Expected to be able to send specific event types");
                });
            case "userInRoom":
            // TODO: Implement
            default:
                return Promise.reject("Requirement '" + requirement.condition + "' not found");
        }
    }
}
