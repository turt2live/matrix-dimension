import HookshotJiraBridgeRecord from "../db/models/HookshotJiraBridgeRecord";
import {
    HookshotConnection,
    HookshotGithubRoomConfig,
    HookshotJiraRoomConfig,
    HookshotTypes
} from "./models/hookshot";
import { HookshotBridge } from "./HookshotBridge";

export class HookshotJiraBridge extends HookshotBridge {
    constructor(requestingUserId: string) {
        super(requestingUserId);
    }

    protected async getDefaultBridge(): Promise<HookshotJiraBridgeRecord> {
        const bridges = await HookshotJiraBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }

        return bridges[0];
    }

    public async getBotUserId(): Promise<string> {
        const confs = await this.getAllServiceInformation();
        const conf = confs.find(c => c.eventType === HookshotTypes.Jira);
        return conf?.botUserId;
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await HookshotJiraBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges && bridges.length > 0 && !!(await this.getBotUserId());
    }

    public async getRoomConfigurations(inRoomId: string): Promise<HookshotGithubRoomConfig[]> {
        return (await this.getAllRoomConfigurations(inRoomId)).filter(c => c.eventType === HookshotTypes.Jira);
    }

    public async bridgeRoom(roomId: string): Promise<HookshotJiraRoomConfig> {
        const bridge = await this.getDefaultBridge();

        const body = {};
        return await this.doProvisionRequest<HookshotConnection>(bridge, "PUT", `/v1/${roomId}/connections/${HookshotTypes.Jira}`, null, body);
    }

    public async unbridgeRoom(roomId: string, connectionId: string): Promise<void> {
        const bridge = await this.getDefaultBridge();
        await this.doProvisionRequest(bridge, "DELETE", `/v1/${roomId}/connections/${connectionId}`);
    }
}
