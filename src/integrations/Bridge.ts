import { Integration } from "./Integration";
import BridgeRecord from "../db/models/BridgeRecord";
import { AvailableNetworks, LinkedChannels } from "../bridges/IrcBridge";
import { PortalInfo, PuppetInfo } from "../bridges/TelegramBridge";
import { WebhookConfiguration } from "../bridges/models/webhooks";
import { BridgedChannel } from "../bridges/SlackBridge";
import {
    HookshotGithubRoomConfig,
    HookshotJiraInstance,
    HookshotJiraRoomConfig,
    HookshotWebhookRoomConfig
} from "../bridges/models/hookshot";

const PRIVATE_ACCESS_SUPPORTED_BRIDGES = ["webhooks"];

export class Bridge extends Integration {
    constructor(bridge: BridgeRecord, public config: any) {
        super(bridge);
        this.category = "bridge";

        if (PRIVATE_ACCESS_SUPPORTED_BRIDGES.indexOf(bridge.type) !== -1) this.requirements = [];
        else this.requirements = [{
            condition: "publicRoom",
            expectedValue: true,
            argument: null, // not used
        }];

        // We'll just say we don't support encryption
        this.isEncryptionSupported = false;
    }
}

export interface IrcBridgeConfiguration {
    availableNetworks: AvailableNetworks;
    links: LinkedChannels;
}

export interface TelegramBridgeConfiguration {
    botUsername: string;
    linked: number[];
    portalInfo: PortalInfo;
    puppet: PuppetInfo;
}

export interface WebhookBridgeConfiguration {
    webhooks: WebhookConfiguration[];
    botUserId: string;
}

export interface SlackBridgeConfiguration {
    link: BridgedChannel;
    botUserId: string;
}

export interface HookshotGithubBridgeConfiguration {
    botUserId: string;
    connections: HookshotGithubRoomConfig[];
}

export interface HookshotJiraBridgeConfiguration {
    botUserId: string;
    connections: HookshotJiraRoomConfig[];
    loggedIn: boolean;
    instances?: HookshotJiraInstance[];
}

export interface HookshotWebhookBridgeConfiguration {
    botUserId: string;
    connections: HookshotWebhookRoomConfig[];
}
