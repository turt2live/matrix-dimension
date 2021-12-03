import {
    HookshotTypes,
    HookshotWebhookRoomConfig
} from "./models/hookshot";
import { HookshotBridge } from "./HookshotBridge";
import HookshotWebhookBridgeRecord from "../db/models/HookshotWebhookBridgeRecord";

export class HookshotWebhookBridge extends HookshotBridge {
    constructor(requestingUserId: string) {
        super(requestingUserId);
    }

    protected async getDefaultBridge(): Promise<HookshotWebhookBridgeRecord> {
        const bridges = await HookshotWebhookBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }

        return bridges[0];
    }

    public async getBotUserId(): Promise<string> {
        const confs = await this.getAllServiceInformation();
        const conf = confs.find(c => c.eventType === HookshotTypes.Webhook);
        return conf?.botUserId;
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await HookshotWebhookBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges && bridges.length > 0 && !!(await this.getBotUserId());
    }

    public async getRoomConfigurations(inRoomId: string): Promise<HookshotWebhookRoomConfig[]> {
        return (await this.getAllRoomConfigurations(inRoomId)).filter(c => c.eventType === HookshotTypes.Webhook);
    }

    public async newConnection(roomId: string, name: string): Promise<HookshotWebhookRoomConfig> {
        const bridge = await this.getDefaultBridge();

        const body = {
            name,
        };
        return await this.doProvisionRequest<HookshotWebhookRoomConfig>(bridge, "PUT", `/v1/${roomId}/connections/${HookshotTypes.Webhook}`, null, body);
    }

    public async removeConnection(roomId: string, connectionId: string): Promise<void> {
        const bridge = await this.getDefaultBridge();
        await this.doProvisionRequest(bridge, "DELETE", `/v1/${roomId}/connections/${connectionId}`);
    }
}
