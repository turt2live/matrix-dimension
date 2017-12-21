import { Component, Injectable } from "@angular/core";
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
            "rss": {
                //component: RssConfigComponent,
            },
            "travisci": {
                //component: TravisCiConfigComponent,
            },
            "circleci": {
                //component: CircleCiConfigComponent,
            },
        },
        "bridge": {
            "irc": {
                //component: IrcConfigComponent,
            },
        },
        "widget": {
            "customwidget": {
                //component: CustomWidgetConfigComponent,
                types: WIDGET_CUSTOM,
            },
            "youtube": {
                //component: YoutubeWidgetConfigComponent,
                types: WIDGET_YOUTUBE
            },
            "etherpad": {
                //component: EtherpadWidgetConfigComponent,
                types: WIDGET_ETHERPAD,
            },
            "twitch": {
                //component: TwitchWidgetConfigComponent,
                types: WIDGET_TWITCH,
            },
            "jitsi": {
                //component: JitsiWidgetConfigComponent,
                types: WIDGET_JITSI,
            },
            "googledocs": {
                //component: GoogleDocsWidgetConfigComponent,
                types: WIDGET_GOOGLE_DOCS,
            },
            "googlecalendar": {
                //component: GoogleCalendarWidgetConfigComponent,
                types: WIDGET_GOOGLE_CALENDAR,
            },
        },
    };

    static getAllConfigComponents(): Component[] {
        const components = [];

        for (const iType of Object.keys(IntegrationService.supportedIntegrationsMap)) {
            for (const iiType of Object.keys(IntegrationService.supportedIntegrationsMap[iType])) {
                const component = IntegrationService.supportedIntegrationsMap[iType][iiType].component;
                if (component) components.push(component);
            }
        }

        return components;
    }

    static isSupported(integration: Integration): boolean {
        const forType = IntegrationService.supportedIntegrationsMap[integration.category];
        if (!forType) return false;

        if (Object.keys(forType).length === 0) return true;

        return forType[integration.type]; // has sub type
    }

    static getConfigComponent(integration: Integration): Component {
        return IntegrationService.supportedIntegrationsMap[integration.category][integration.type].component;
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
