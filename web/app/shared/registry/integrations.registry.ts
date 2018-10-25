import { Injectable } from "@angular/core";
import {
    WIDGET_CUSTOM,
    WIDGET_ETHERPAD,
    WIDGET_GOOGLE_CALENDAR,
    WIDGET_GOOGLE_DOCS,
    WIDGET_GRAFANA,
    WIDGET_JITSI, WIDGET_SPOTIFY, WIDGET_STICKER_PICKER,
    WIDGET_TRADINGVIEW,
    WIDGET_TWITCH,
    WIDGET_YOUTUBE
} from "../models/widget";
import { FE_Integration } from "../models/integration";

@Injectable()
export class IntegrationsRegistry {

    private static supportedIntegrationsMap = {
        "bot": {}, // empty == supported
        "complex-bot": {
            "rss": {},
            "travisci": {},
            "circleci": {},
        },
        "bridge": {
            "irc": {},
            "telegram": {},
            "webhooks": {},
            "gitter": {},
            "slack": {},
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
            "grafana": {
                types: WIDGET_GRAFANA,
            },
            "tradingview": {
                types: WIDGET_TRADINGVIEW,
            },
            "spotify": {
                types: WIDGET_SPOTIFY,
            },
            "stickerpicker": {
                types: WIDGET_STICKER_PICKER,
            },
        },
    };

    static isSupported(integration: FE_Integration): boolean {
        const forType = IntegrationsRegistry.supportedIntegrationsMap[integration.category];
        if (!forType) return false;

        if (Object.keys(forType).length === 0) return true;

        return forType[integration.type]; // has sub type
    }

    static getIntegrationForScreen(screen: string): { category: string, type: string } {
        for (const category of Object.keys(IntegrationsRegistry.supportedIntegrationsMap)) {
            for (const type of Object.keys(IntegrationsRegistry.supportedIntegrationsMap[category])) {
                const integrationTypes = IntegrationsRegistry.supportedIntegrationsMap[category][type].types;
                if (!integrationTypes) continue;

                const integrationScreens = integrationTypes.map(t => "type_" + t);
                if (integrationScreens.includes(screen)) return {category: category, type: type};
            }
        }

        return null;
    }

    private constructor() {
    }
}
