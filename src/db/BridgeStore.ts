import { Bridge } from "../integrations/Bridge";
import BridgeRecord from "./models/BridgeRecord";
import { IrcBridge } from "../bridges/IrcBridge";

export class BridgeStore {

    public static async listAll(requestingUserId: string, isEnabled?: boolean, inRoomId?: string): Promise<Bridge[]> {
        let conditions = {};
        if (isEnabled === true || isEnabled === false) conditions = {where: {isEnabled: isEnabled}};

        const allRecords = await BridgeRecord.findAll(conditions);
        const enabledBridges: Bridge[] = [];

        for (const bridgeRecord of allRecords) {
            if (isEnabled === true || isEnabled === false) {
                const isLogicallyEnabled = await BridgeStore.isLogicallyEnabled(bridgeRecord, requestingUserId);
                if (isLogicallyEnabled !== isEnabled) continue;
            }

            const bridgeConfig = await BridgeStore.getConfiguration(bridgeRecord, requestingUserId, inRoomId);
            enabledBridges.push(new Bridge(bridgeRecord, bridgeConfig));
        }

        return enabledBridges;
    }

    public static async setEnabled(type: string, isEnabled: boolean): Promise<any> {
        const bridge = await BridgeRecord.findOne({where: {type: type}});
        if (!bridge) throw new Error("Bridge not found");

        bridge.isEnabled = isEnabled;
        return bridge.save();
    }

    public static async setBridgeRoomConfig(requestingUserId: string, integrationType: string, inRoomId: string, newConfig: any): Promise<any> {
        const record = await BridgeRecord.findOne({where: {type: integrationType}});
        if (!record) throw new Error("Bridge not found");

        if (integrationType === "irc") {
            const irc = new IrcBridge(requestingUserId);
            return irc.setRoomConfiguration(requestingUserId, inRoomId, newConfig);
        } else throw new Error("Unsupported bridge");
    }

    private static async isLogicallyEnabled(record: BridgeRecord, requestingUserId: string): Promise<boolean> {
        if (record.type === "irc") {
            const irc = new IrcBridge(requestingUserId);
            return irc.hasNetworks();
        } else return true;
    }

    private static async getConfiguration(record: BridgeRecord, requestingUserId: string, inRoomId?: string): Promise<any> {
        if (record.type === "irc") {
            if (!inRoomId) return {}; // The bridge's admin config is handled by other APIs
            const irc = new IrcBridge(requestingUserId);
            return irc.getRoomConfiguration(requestingUserId, inRoomId);
        } else return {};
    }

    private constructor() {
    }

}