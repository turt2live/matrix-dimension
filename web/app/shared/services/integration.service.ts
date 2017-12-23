import { Injectable } from "@angular/core";
import {
    WIDGET_CUSTOM, WIDGET_ETHERPAD, WIDGET_GOOGLE_CALENDAR, WIDGET_GOOGLE_DOCS, WIDGET_JITSI, WIDGET_TWITCH,
    WIDGET_YOUTUBE
} from "../models/widget";
import { Integration } from "../models/integration";

@Injectable()
export class IntegrationService {

    private static supportedIntegrationsMap = {
        "bot": {}, // empty == supported
        "complex-bot": {
            "rss": {},
            "travisci": {},
            "circleci": {},
        },
        "bridge": {
            "irc": {},
        },
        "widget": {
            "custom": {
                types: WIDGET_CUSTOM,
            },
            "youtube": {
                types: WIDGET_YOUTUBE
            },
            "etherpad": {
                types: WIDGET_ETHERPAD,
            },
            "twitch": {
                types: WIDGET_TWITCH,
            },
            "jitsi": {
                types: WIDGET_JITSI,
            },
            "googledocs": {
                types: WIDGET_GOOGLE_DOCS,
            },
            "googlecalendar": {
                types: WIDGET_GOOGLE_CALENDAR,
            },
        },
    };

    static isSupported(integration: Integration): boolean {
        const forType = IntegrationService.supportedIntegrationsMap[integration.category];
        if (!forType) return false;

        if (Object.keys(forType).length === 0) return true;

        return forType[integration.type]; // has sub type
    }

    static getIntegrationForScreen(screen: string): { category: string, type: string } {
        for (const iType of Object.keys(IntegrationService.supportedIntegrationsMap)) {
            for (const iiType of Object.keys(IntegrationService.supportedIntegrationsMap[iType])) {
                const integrationTypes = IntegrationService.supportedIntegrationsMap[iType][iiType].types;
                const integrationScreens = integrationTypes.map(t => "type_" + t);
                if (integrationScreens.includes(screen)) return {category: iType, type: iiType};
            }
        }

        return null;
    }

    private constructor() {
    }
}
