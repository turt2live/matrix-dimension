import { Injectable } from "@angular/core";
import { Integration } from "../models/integration";
import { RssConfigComponent } from "../../configs/rss/rss-config.component";
import { ContainerContent } from "ngx-modialog";
import { IrcConfigComponent } from "../../configs/irc/irc-config.component";
import { TravisCiConfigComponent } from "../../configs/travisci/travisci-config.component";
import { CustomWidgetConfigComponent } from "../../configs/widget/custom_widget/custom_widget-config.component";
import { YoutubeWidgetConfigComponent } from "../../configs/widget/youtube/youtube-config.component";
import { TwitchWidgetConfigComponent } from "../../configs/widget/twitch/twitch-config.component";
import { EtherpadWidgetConfigComponent } from "../../configs/widget/etherpad/etherpad-config.component";
import { JitsiWidgetConfigComponent } from "../../configs/widget/jitsi/jitsi-config.component";
import {
    WIDGET_CUSTOM, WIDGET_ETHERPAD, WIDGET_GOOGLE_CALENDAR, WIDGET_GOOGLE_DOCS, WIDGET_JITSI, WIDGET_TWITCH,
    WIDGET_YOUTUBE
} from "../models/widget";
import { GoogleDocsWidgetConfigComponent } from "../../configs/widget/googledocs/googledocs-config.component";
import { GoogleCalendarWidgetConfigComponent } from "../../configs/widget/googlecalendar/googlecalendar-config.component";

@Injectable()
export class IntegrationService {

    private static supportedIntegrationsMap = {
        "bot": {}, // empty == supported
        "complex-bot": {
            "rss": {
                component: RssConfigComponent,
            },
            "travisci": {
                component: TravisCiConfigComponent,
            },
        },
        "bridge": {
            "irc": {
                component: IrcConfigComponent,
            },
        },
        "widget": {
            "customwidget": {
                component: CustomWidgetConfigComponent,
                types: WIDGET_CUSTOM,
            },
            "youtube": {
                component: YoutubeWidgetConfigComponent,
                types: WIDGET_YOUTUBE
            },
            "etherpad": {
                component: EtherpadWidgetConfigComponent,
                types: WIDGET_ETHERPAD,
            },
            "twitch": {
                component: TwitchWidgetConfigComponent,
                types: WIDGET_TWITCH,
            },
            "jitsi": {
                component: JitsiWidgetConfigComponent,
                types: WIDGET_JITSI,
            },
            "googledocs": {
                component: GoogleDocsWidgetConfigComponent,
                types: WIDGET_GOOGLE_DOCS,
            },
            "googlecalendar": {
                component: GoogleCalendarWidgetConfigComponent,
                types: WIDGET_GOOGLE_CALENDAR,
            },
        },
    };

    static getAllConfigComponents(): ContainerContent[] {
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
        const forType = IntegrationService.supportedIntegrationsMap[integration.type];
        if (!forType) return false;

        if (Object.keys(forType).length === 0) return true;

        return forType[integration.integrationType]; // has sub type
    }

    static hasConfig(integration: Integration): boolean {
        return integration.type !== "bot";
    }

    static getConfigComponent(integration: Integration): ContainerContent {
        return IntegrationService.supportedIntegrationsMap[integration.type][integration.integrationType].component;
    }

    static getIntegrationForScreen(screen: string): { type: string, integrationType: string } {
        for (const iType of Object.keys(IntegrationService.supportedIntegrationsMap)) {
            for (const iiType of Object.keys(IntegrationService.supportedIntegrationsMap[iType])) {
                const integrationTypes = IntegrationService.supportedIntegrationsMap[iType][iiType].types;
                const integrationScreens = integrationTypes.map(t => "type_" + t);
                if (integrationScreens.includes(screen)) return {type: iType, integrationType: iiType};
            }
        }

        return null;
    }

    constructor() {
    }
}
