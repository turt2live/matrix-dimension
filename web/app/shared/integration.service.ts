import { Injectable } from "@angular/core";
import { Integration } from "./models/integration";
import { RssConfigComponent } from "../configs/rss/rss-config.component";
import { ContainerContent } from "angular2-modal";
import { IrcConfigComponent } from "../configs/irc/irc-config.component";

@Injectable()
export class IntegrationService {

    private static supportedTypeMap = {
        "bot": true,
        "complex-bot": {
            "rss": true
        },
        "bridge": {
            "irc": true
        }
    };

    private static components = {
        "complex-bot": {
            "rss": RssConfigComponent
        },
        "bridge": {
            "irc": IrcConfigComponent
        }
    };

    static isSupported(integration: Integration): boolean {
        if (IntegrationService.supportedTypeMap[integration.type] === true) return true;
        if (!IntegrationService.supportedTypeMap[integration.type]) return false;
        return IntegrationService.supportedTypeMap[integration.type][integration.integrationType] === true;
    }

    static hasConfig(integration: Integration): boolean {
        return integration.type !== "bot";
    }

    static getConfigComponent(integration: Integration): ContainerContent {
        return IntegrationService.components[integration.type][integration.integrationType];
    }

    constructor() {
    }
}
