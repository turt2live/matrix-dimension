import HookshotGithubBridgeRecord from "../db/models/HookshotGithubBridgeRecord";
import {
    HookshotConnection,
    HookshotGithubRoomConfig,
    HookshotTypes
} from "./models/hookshot";
import { HookshotBridge } from "./HookshotBridge";

export class HookshotGithubBridge extends HookshotBridge {
    constructor(requestingUserId: string) {
        super(requestingUserId);
    }

    protected async getDefaultBridge(): Promise<HookshotGithubBridgeRecord> {
        const bridges = await HookshotGithubBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }

        return bridges[0];
    }

    public async getBotUserId(): Promise<string> {
        const confs = await this.getAllServiceInformation();
        const conf = confs.find(c => c.eventType === HookshotTypes.Github);
        return conf?.botUserId;
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await HookshotGithubBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges && bridges.length > 0 && !!(await this.getBotUserId());
    }

    public async getRoomConfigurations(inRoomId: string): Promise<HookshotGithubRoomConfig[]> {
        return (await this.getAllRoomConfigurations(inRoomId)).filter(c => c.eventType === HookshotTypes.Github);
    }

    public async bridgeRoom(roomId: string): Promise<HookshotGithubRoomConfig> {
        const bridge = await this.getDefaultBridge();

        const body = {};
        return await this.doProvisionRequest<HookshotConnection>(bridge, "PUT", `/v1/${roomId}/connections/${HookshotTypes.Github}`, null, body);
    }

    public async unbridgeRoom(roomId: string, connectionId: string): Promise<void> {
        const bridge = await this.getDefaultBridge();
        await this.doProvisionRequest(bridge, "DELETE", `/v1/${roomId}/connections/${connectionId}`);
    }
}
