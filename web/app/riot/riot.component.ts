import { Component, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../shared/api.service";
import { ScalarService } from "../shared/scalar.service";
import { ToasterService } from "angular2-toaster";
import { Integration } from "../shared/models/integration";
import { IntegrationService } from "../shared/integration.service";
import * as _ from "lodash";
import { IntegrationComponent } from "../integration/integration.component";

const CATEGORY_MAP = {
    "Widgets": ["widget"],
    "Bots": ["complex-bot", "bot"],
    "Bridges": ["bridge"],
};

@Component({
    selector: "my-riot",
    templateUrl: "./riot.component.html",
    styleUrls: ["./riot.component.scss"],
})
export class RiotComponent {
    @ViewChildren(IntegrationComponent) integrationComponents: Array<IntegrationComponent>;

    public isLoading = true;
    public isError = false;
    public errorMessage: string;
    public isRoomEncrypted: boolean;

    private scalarToken: string;
    private roomId: string;
    private userId: string;
    private requestedScreen: string = null;
    private requestedIntegration: string = null;
    private integrationsForCategory: { [category: string]: Integration[] } = {};
    private categoryMap: { [categoryName: string]: string[] } = CATEGORY_MAP;

    constructor(private activatedRoute: ActivatedRoute,
                private api: ApiService,
                private scalar: ScalarService,
                private toaster: ToasterService) {
        let params: any = this.activatedRoute.snapshot.queryParams;

        this.requestedScreen = params.screen;
        this.requestedIntegration = params.integ_id;

        if (!params.scalar_token || !params.room_id) {
            console.error("Unable to load Dimension. Missing room ID or scalar token.");
            this.isError = true;
            this.isLoading = false;
            this.errorMessage = "Unable to load Dimension - missing room ID or token.";
        } else {
            this.roomId = params.room_id;
            this.scalarToken = params.scalar_token;

            this.api.getTokenOwner(params.scalar_token).then(userId => {
                if (!userId) {
                    console.error("No user returned for token. Is the token registered in Dimension?");
                    this.isError = true;
                    this.isLoading = false;
                    this.errorMessage = "Could not verify your token. Please try logging out of Riot and back in. Be sure to back up your encryption keys!";
                } else {
                    this.userId = userId;
                    console.log("Scalar token belongs to " + userId);
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

    public hasIntegrations(): boolean {
        for (const category of this.getCategories()) {
            if (this.getIntegrationsIn(category).length > 0) return true;
        }

        return false;
    }

    public getCategories(): string[] {
        return Object.keys(this.categoryMap);
    }

    public getIntegrationsIn(category: string): Integration[] {
        return this.integrationsForCategory[category];
    }

    public modifyIntegration(integration: Integration) {
        console.log(this.userId + " is trying to modify " + integration.name);

        if (integration.hasAdditionalConfig) {
            // TODO: Navigate to edit screen
            console.log("EDIT SCREEN FOR " + integration.name);
        } else {
            // It's a flip-a-bit (simple bot)
            // TODO: "Are you sure?" dialog

            let promise = null;
            if (!integration.isEnabled) {
                promise = this.scalar.inviteUser(this.roomId, integration.userId);
            } else promise = this.api.removeIntegration(this.roomId, integration.type, integration.integrationType, this.scalarToken);

            // We set this ahead of the promise for debouncing
            integration.isEnabled = !integration.isEnabled;
            integration.isUpdating = true;
            promise.then(() => {
                integration.isUpdating = false;
                if (integration.isEnabled) this.toaster.pop("success", integration.name + " was invited to the room");
                else this.toaster.pop("success", integration.name + " was removed from the room");
            }).catch(err => {
                integration.isEnabled = !integration.isEnabled; // revert the status change
                integration.isUpdating = false;
                console.error(err);

                let errorMessage = null;
                if (err.json) errorMessage = err.json().error;
                if (err.response && err.response.error) errorMessage = err.response.error.message;
                if (!errorMessage) errorMessage = "Could not update integration status";

                this.toaster.pop("error", errorMessage);
            })
        }
    }

    private prepareIntegrations() {
        this.scalar.isRoomEncrypted(this.roomId).then(payload => {
            this.isRoomEncrypted = payload.response;
            return this.api.getIntegrations(this.roomId, this.scalarToken);
        }).then(integrations => {
            const supportedIntegrations: Integration[] = _.filter(integrations, i => IntegrationService.isSupported(i));

            for (const integration of supportedIntegrations) {
                // Widgets technically support encrypted rooms, so unless they explicitly declare that
                // they don't, we'll assume they do. A warning about adding widgets in encrypted rooms
                // is displayed to users elsewhere.
                if (integration.type === "widget" && integration.supportsEncryptedRooms !== false)
                    integration.supportsEncryptedRooms = true;
            }

            // Flag integrations that aren't supported in encrypted rooms
            if (this.isRoomEncrypted) {
                for (const integration of supportedIntegrations) {
                    if (!integration.supportsEncryptedRooms) {
                        integration.isSupported = false;
                        integration.notSupportedReason = "This integration is not supported in encrypted rooms";
                    }
                }
            }

            // Set up the categories
            for (const category of Object.keys(this.categoryMap)) {
                const supportedTypes = this.categoryMap[category];
                this.integrationsForCategory[category] = _.filter(supportedIntegrations, i => supportedTypes.indexOf(i.type) !== -1);
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
    }

    private tryOpenConfigScreen() {
        let type = null;
        let integrationType = null;
        if (!this.requestedScreen) return;

        const targetIntegration = IntegrationService.getIntegrationForScreen(this.requestedScreen);
        if (targetIntegration) {
            type = targetIntegration.type;
            integrationType = targetIntegration.integrationType;
        } else {
            console.log("Unknown screen requested: " + this.requestedScreen);
        }

        let opened = false;
        this.integrationComponents.forEach(component => {
            if (opened) return;
            if (component.integration.type !== type || component.integration.integrationType !== integrationType) return;
            console.log("Configuring integration " + this.requestedIntegration + " type=" + type + " integrationType=" + integrationType);
            component.configureIntegration(this.requestedIntegration);
            opened = true;
        });
        if (!opened) {
            console.log("Failed to find integration component for type=" + type + " integrationType=" + integrationType);
        }
    }

    private updateIntegrationState(integration: Integration) {
        integration.hasAdditionalConfig = IntegrationService.hasConfig(integration);

        if (integration.type === "widget") {
            if (!integration.requirements) integration.requirements = {};
            integration.requirements["canSetWidget"] = true;
        }

        // If the integration has requirements, then we'll check those instead of anything else
        if (integration.requirements) {
            let keys = _.keys(integration.requirements);
            let promises = [];

            for (let key of keys) {
                let requirement = this.checkRequirement(integration, key);
                promises.push(requirement);
            }

            return Promise.all(promises).then(() => {
                integration.isSupported = true;
                integration.notSupportedReason = null;
            }, error => {
                console.error(error);
                integration.isSupported = false;
                integration.notSupportedReason = error;
            });
        }

        // The integration doesn't have requirements, so we'll just make sure the bot user can be retrieved.
        return this.scalar.getMembershipState(this.roomId, integration.userId).then(payload => {
            if (payload.response) {
                integration.isSupported = true;
                integration.notSupportedReason = null;
                integration.isEnabled = (payload.response.membership === "join" || payload.response.membership === "invite");
            } else {
                console.error("No response received to membership query of " + integration.userId);
                integration.isSupported = false;
                integration.notSupportedReason = "Unable to query membership state for this bot";
            }
        }, (error) => {
            console.error(error);
            integration.isSupported = false;
            integration.notSupportedReason = "Unable to query membership state for this bot";
        });
    }

    private checkRequirement(integration: Integration, key: string) {
        let requirement = integration.requirements[key];

        switch (key) {
            case "joinRule":
                return this.scalar.getJoinRule(this.roomId).then(payload => {
                    if (!payload.response) {
                        return Promise.reject("Could not communicate with Riot");
                    }
                    return payload.response.join_rule === requirement
                        ? Promise.resolve()
                        : Promise.reject("The room must be " + requirement + " to use this integration.");
                });
            case "canSetWidget":
                const processPayload = payload => {
                    const response = <any>payload.response;
                    if (response === true) return Promise.resolve();
                    if (response.error || response.error.message)
                        return Promise.reject("You cannot modify widgets in this room");
                    return Promise.reject("Error communicating with Riot");
                };
                return this.scalar.canSendEvent(this.roomId, "im.vector.modular.widgets", true).then(processPayload).catch(processPayload);
            default:
                return Promise.reject("Requirement '" + key + "' not found");
        }
    }
}
