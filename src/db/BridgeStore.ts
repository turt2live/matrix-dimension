import {
    Bridge,
    GitterBridgeConfiguration,
    SlackBridgeConfiguration,
    TelegramBridgeConfiguration,
    WebhookBridgeConfiguration
} from "../integrations/Bridge";
import BridgeRecord from "./models/BridgeRecord";
import { IrcBridge } from "../bridges/IrcBridge";
import { LogService } from "matrix-js-snippets";
import { TelegramBridge } from "../bridges/TelegramBridge";
import { WebhooksBridge } from "../bridges/WebhooksBridge";
import { GitterBridge } from "../bridges/GitterBridge";
import { SlackBridge } from "../bridges/SlackBridge";

export class BridgeStore {

    public static async listAll(requestingUserId: string, isEnabled?: boolean, inRoomId?: string): Promise<Bridge[]> {
        let conditions = {};
        if (isEnabled === true || isEnabled === false) conditions = {where: {isEnabled: isEnabled}};

        const allRecords = await BridgeRecord.findAll(conditions);
        const enabledBridges: Bridge[] = [];

        for (const bridgeRecord of allRecords) {
            try {
                if (isEnabled === true || isEnabled === false) {
                    const isLogicallyEnabled = await BridgeStore.isLogicallyEnabled(bridgeRecord, requestingUserId);
                    if (isLogicallyEnabled !== isEnabled) continue;
                }

                const bridgeConfig = await BridgeStore.getConfiguration(bridgeRecord, requestingUserId, inRoomId);
                enabledBridges.push(new Bridge(bridgeRecord, bridgeConfig));
            } catch (e) {
                LogService.error("BridgeStore", "Failed to load configuration for bridge: " + bridgeRecord.name);
                LogService.error("BridgeStore", e);
            }
        }

        return enabledBridges;
    }

    public static async setEnabled(type: string, isEnabled: boolean): Promise<any> {
        const bridge = await BridgeRecord.findOne({where: {type: type}});
        if (!bridge) throw new Error("Bridge not found");

        bridge.isEnabled = isEnabled;
        return bridge.save();
    }

    public static async setBridgeRoomConfig(_requestingUserId: string, integrationType: string, _inRoomId: string, _newConfig: any): Promise<any> {
        const record = await BridgeRecord.findOne({where: {type: integrationType}});
        if (!record) throw new Error("Bridge not found");

        const hasDedicatedApi = ["irc", "telegram", "webhooks", "gitter", "slack"];
        if (hasDedicatedApi.indexOf(integrationType) !== -1) {
            throw new Error("This bridge should be modified with the dedicated API");
        } else throw new Error("Unsupported bridge");
    }

    private static async isLogicallyEnabled(record: BridgeRecord, requestingUserId: string): Promise<boolean> {
        if (record.type === "irc") {
            const irc = new IrcBridge(requestingUserId);
            return irc.hasNetworks();
        } else if (record.type === "telegram") {
            const telegram = new TelegramBridge(requestingUserId);
            return telegram.isBridgingEnabled();
        } else if (record.type === "webhooks") {
            const webhooks = new WebhooksBridge(requestingUserId);
            return webhooks.isBridgingEnabled();
        } else if (record.type === "gitter") {
            const gitter = new GitterBridge(requestingUserId);
            return gitter.isBridgingEnabled();
        } else if (record.type === "slack") {
            const slack = new SlackBridge(requestingUserId);
            return slack.isBridgingEnabled();
        } else return true;
    }

    private static async getConfiguration(record: BridgeRecord, requestingUserId: string, inRoomId?: string): Promise<any> {
        if (record.type === "irc") {
            if (!inRoomId) return {}; // The bridge's admin config is handled by other APIs
            const irc = new IrcBridge(requestingUserId);
            return irc.getRoomConfiguration(inRoomId);
        } else if (record.type === "telegram") {
            if (!inRoomId) return {}; // The bridge's admin config is handled by other APIs
            const telegram = new TelegramBridge(requestingUserId);
            const roomConf = await telegram.getRoomConfiguration(inRoomId);
            const bridgeInfo = await telegram.getBridgeInfo();
            return <TelegramBridgeConfiguration>{
                botUsername: bridgeInfo.botUsername,
                linked: roomConf.bridged ? [roomConf.chatId] : [],
                portalInfo: roomConf,
                puppet: await telegram.getPuppetInfo(),
            };
        } else if (record.type === "webhooks") {
            if (!inRoomId) return {}; // The bridge's admin config is handled by other APIs
            const webhooks = new WebhooksBridge(requestingUserId);
            const hooks = await webhooks.getHooks(inRoomId);
            const info = await webhooks.getBridgeInfo();
            return <WebhookBridgeConfiguration>{
                webhooks: hooks,
                botUserId: info.botUserId,
            };
        } else if (record.type === "gitter") {
            if (!inRoomId) return {}; // The bridge's admin config is handled by other APIs
            const gitter = new GitterBridge(requestingUserId);
            const info = await gitter.getBridgeInfo();
            const link = await gitter.getLink(inRoomId);
            return <GitterBridgeConfiguration>{
                link: link,
                botUserId: info.botUserId,
            };
        } else if (record.type === "slack") {
            if (!inRoomId) return {}; // The bridge's admin config is handled by other APIs
            const slack = new SlackBridge(requestingUserId);
            const info = await slack.getBridgeInfo();
            const link = await slack.getLink(inRoomId);
            return <SlackBridgeConfiguration>{
                link: link,
                botUserId: info.botUserId,
            };
        } else return {};
    }

    private constructor() {
    }

}