import { Injectable } from "@angular/core";
import { Integration } from "./models/integration";
import { RssConfigComponent } from "../configs/rss/rss-config.component";
import { ContainerContent } from "ngx-modialog";
import { IrcConfigComponent } from "../configs/irc/irc-config.component";
import { TravisCiConfigComponent } from "../configs/travisci/travisci-config.component";
import { CustomWidgetConfigComponent } from "../configs/widget/custom_widget/custom_widget-config.component";
import { YoutubeWidgetConfigComponent } from "../configs/widget/youtube/youtube-config.component";
import { TwitchWidgetConfigComponent } from "../configs/widget/twitch/twitch-config.component";
import { EtherpadWidgetConfigComponent } from "../configs/widget/etherpad/etherpad-config.component";
import { JitsiWidgetConfigComponent } from "../configs/widget/jitsi/jitsi-config.component";
import {
    WIDGET_DIM_CUSTOM,
    WIDGET_DIM_ETHERPAD,
    WIDGET_DIM_JITSI,
    WIDGET_DIM_TWITCH,
    WIDGET_DIM_YOUTUBE
} from "./models/widget";

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
                screenId: "type_" + WIDGET_DIM_CUSTOM,
            },
            "youtube": {
                component: YoutubeWidgetConfigComponent,
                screenId: "type_" + WIDGET_DIM_YOUTUBE,
            },
            "etherpad": {
                component: EtherpadWidgetConfigComponent,
                screenId: "type_" + WIDGET_DIM_ETHERPAD,
            },
            "twitch": {
                component: TwitchWidgetConfigComponent,
                screenId: "type_" + WIDGET_DIM_TWITCH,
            },
            "jitsi": {
                component: JitsiWidgetConfigComponent,
                screenId: "type_" + WIDGET_DIM_JITSI,
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
                const iScreen = IntegrationService.supportedIntegrationsMap[iType][iiType].screenId;
                if (screen === iScreen) return {type: iType, integrationType: iiType};
            }
        }

        return null;
    }

    constructor() {
    }
}
