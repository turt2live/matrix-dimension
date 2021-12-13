import HookshotJiraBridgeRecord from "../db/models/HookshotJiraBridgeRecord";
import { HookshotJiraProject, HookshotJiraRoomConfig, HookshotJiraUserInfo, HookshotTypes } from "./models/hookshot";
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

    public async getAuthUrl(): Promise<string> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest(bridge, "GET", `/v1/jira/oauth`).then(r => r['url']);
    }

    public async getLoggedInUserInfo(): Promise<HookshotJiraUserInfo> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<HookshotJiraUserInfo>(bridge, "GET", `/v1/jira/account`);
    }

    public async getProjects(instanceName: string): Promise<HookshotJiraProject[]> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<HookshotJiraProject[]>(bridge, "GET", `/v1/jira/instances/${instanceName}/projects`);
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

    public async getRoomConfigurations(inRoomId: string): Promise<HookshotJiraRoomConfig[]> {
        return (await this.getAllRoomConfigurations(inRoomId))
            .filter(c => c.eventType === HookshotTypes.Jira);
    }

    public async bridgeRoom(roomId: string, instanceName: string, projectKey: string): Promise<HookshotJiraRoomConfig> {
        const bridge = await this.getDefaultBridge();

        const projects = await this.getProjects(instanceName);
        const project = projects.find(p => p.key === projectKey);
        if (!project) throw new Error("Could not find project");

        const body = {
            url: project.url,
            commandPrefix: "!jira",
        };
        return await this.doProvisionRequest<HookshotJiraRoomConfig>(bridge, "PUT", `/v1/${roomId}/connections/${HookshotTypes.Jira}`, null, body);
    }

    public async unbridgeRoom(roomId: string, connectionId: string): Promise<void> {
        const bridge = await this.getDefaultBridge();
        await this.doProvisionRequest(bridge, "DELETE", `/v1/${roomId}/connections/${encodeURIComponent(connectionId)}`);
    }
}
