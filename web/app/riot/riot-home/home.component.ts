import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { ActivatedRoute } from "@angular/router";
import { ScalarClientApiService } from "../../shared/services/scalar-client-api.service";
import * as _ from "lodash";
import { ScalarServerApiService } from "../../shared/services/scalar-server-api.service";
import { AuthedApi } from "../../shared/services/AuthedApi";
import { DimensionApiService } from "../../shared/services/dimension-api.service";
import { Integration, IntegrationRequirement } from "../../shared/models/integration";
import { IntegrationService } from "../../shared/services/integration.service";

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

    private roomId: string;
    private userId: string;
    private requestedScreen: string = null;
    private requestedIntegration: string = null;
    public integrationsForCategory: { [category: string]: Integration[] } = {};
    private categoryMap: { [categoryName: string]: string[] } = CATEGORY_MAP;

    constructor(private activatedRoute: ActivatedRoute,
                private scalarApi: ScalarServerApiService,
                private scalar: ScalarClientApiService,
                private dimensionApi: DimensionApiService,
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
            AuthedApi.SCALAR_TOKEN = params.scalar_token;

            this.scalarApi.getAccount().then(response => {
                const userId = response.user_id;
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

    private getIntegrations(): Integration[] {
        const result: Integration[] = [];

        for (const category of this.getCategories()) {
            for (const integration of this.getIntegrationsIn(category)) {
                result.push(integration);
            }
        }

        return result;
    }


    public modifyIntegration(integration: Integration) {
        console.log(this.userId + " is trying to modify " + integration.displayName);

        if (integration.category === "bot") {
            // It's a bot
            // TODO: "Are you sure?" dialog

            // let promise = null;
            const promise = Promise.resolve();
            // if (!integration._inRoom) {
            //     promise = this.scalar.inviteUser(this.roomId, integration.userId);
            // } else promise = this.api.removeIntegration(this.roomId, integration.type, integration.integrationType, this.scalarToken);
            // We set this ahead of the promise for debouncing

            integration._inRoom = !integration._inRoom;
            integration._isUpdating = true;
            promise.then(() => {
                integration._isUpdating = false;
                if (integration._inRoom) this.toaster.pop("success", integration.displayName + " was invited to the room");
                else this.toaster.pop("success", integration.displayName + " was removed from the room");
            }).catch(err => {
                integration._inRoom = !integration._inRoom; // revert the status change
                integration._isUpdating = false;
                console.error(err);

                let errorMessage = null;
                if (err.json) errorMessage = err.json().error;
                if (err.response && err.response.error) errorMessage = err.response.error.message;
                if (!errorMessage) errorMessage = "Could not update integration status";

                this.toaster.pop("error", errorMessage);
            });
        } else {
            // TODO: Navigate to edit screen
            console.log("EDIT SCREEN FOR " + integration.displayName);
        }
    }

    private prepareIntegrations() {
        this.scalar.isRoomEncrypted(this.roomId).then(payload => {
            this.isRoomEncrypted = payload.response;
            return this.dimensionApi.getIntegrations(this.roomId);
        }).then(response => {
            const integrations: Integration[] = _.flatten(Object.keys(response).map(k => response[k]));
            const supportedIntegrations: Integration[] = _.filter(integrations, i => IntegrationService.isSupported(i));

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
    }

    private tryOpenConfigScreen() {
        let category = null;
        let type = null;
        if (!this.requestedScreen) return;

        const targetIntegration = IntegrationService.getIntegrationForScreen(this.requestedScreen);
        if (targetIntegration) {
            category = targetIntegration.category;
            type = targetIntegration.type;
        } else {
            console.log("Unknown screen requested: " + this.requestedScreen);
        }

        for (const integration of this.getIntegrations()) {
            if (integration.category === category && integration.type === type) {
                console.log("Configuring integration " + this.requestedIntegration + " category=" + category + " type=" + type);
                // TODO: Actually edit integration
                return;
            }
        }

        console.log("Failed to find integration component for category=" + category + " type=" + type);
    }

    private updateIntegrationState(integration: Integration) {
        if (!integration.requirements) return;

        let promises = integration.requirements.map(r => this.checkRequirement(r));

        return Promise.all(promises).then(() => {
            integration._isSupported = true;
            integration._notSupportedReason = null;
        }, error => {
            console.error(error);
            integration._isSupported = false;
            integration._notSupportedReason = error;
        });
    }

    private checkRequirement(requirement: IntegrationRequirement) {
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
            default:
                return Promise.reject("Requirement '" + requirement.condition + "' not found");
        }
    }
}
