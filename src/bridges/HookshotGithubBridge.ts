import HookshotGithubBridgeRecord from "../db/models/HookshotGithubBridgeRecord";
import {
    HookshotGithubAuthUrls,
    HookshotGithubOrg,
    HookshotGithubOrgReposDto,
    HookshotGithubRepo,
    HookshotGithubRoomConfig,
    HookshotGithubUserInfo,
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

    public async getAuthUrls(): Promise<HookshotGithubAuthUrls> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest(bridge, "GET", `/v1/github/oauth`).then(r => ({userUrl: r['user_url'], orgUrl: r['org_url']}));
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

    public async getLoggedInUserInfo(): Promise<HookshotGithubUserInfo> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<HookshotGithubUserInfo>(bridge, "GET", `/v1/github/account`);
    }

    public async getRepos(orgId: string): Promise<HookshotGithubRepo[]> {
        const bridge = await this.getDefaultBridge();
        const results: HookshotGithubRepo[] = [];
        let more = true;
        let page = 1;
        let perPage = 10;
        do {
            const res = await this.doProvisionRequest<HookshotGithubRepo[]>(bridge, "GET", `/v1/github/orgs/${orgId}/repositories`, {
                page,
                perPage,
            }).then(r => r['repositories']);
            results.push(...res);
            if (res.length < perPage) more = false;
            page++;
        } while(more);
        return results;
    }

    public async getInstalledLocations(): Promise<HookshotGithubOrgReposDto[]> {
        const bridge = await this.getDefaultBridge();

        const orgs: HookshotGithubOrg[] = [];
        let lastOrgs: HookshotGithubOrg[] = [];
        let page = 1;
        let perPage = 10;
        do {
            const res = await this.doProvisionRequest<HookshotGithubUserInfo>(bridge, "GET", `/v1/github/account`, {page, perPage});
            lastOrgs = res.organisations;
            page++;
            orgs.push(...lastOrgs);
        } while(lastOrgs.length >= perPage);

        const results: HookshotGithubOrgReposDto[] = [];
        for (const org of orgs) {
            page = 1;
            let lastRepos: HookshotGithubRepo[] = [];
            const repos: HookshotGithubRepo[] = [];
            let changeUrl: string;
            do {
                const res = await this.doProvisionRequest(bridge, "GET", `/v1/github/orgs/${org.name}/repositories`, {page, perPage});
                lastRepos = res['repositories'];
                changeUrl = res['changeSelectionUrl'];
                page++;
                repos.push(...lastRepos);
            } while(lastRepos.length >= perPage);

            results.push({
                organization: org,
                repositories: repos,
                changeSelectionUrl: changeUrl,
            });
        }

        return results;
    }

    public async getRoomConfigurations(inRoomId: string): Promise<HookshotGithubRoomConfig[]> {
        return (await this.getAllRoomConfigurations(inRoomId)).filter(c => c.eventType === HookshotTypes.Github);
    }

    public async bridgeRoom(roomId: string, orgId: string, repoId: string): Promise<HookshotGithubRoomConfig> {
        const bridge = await this.getDefaultBridge();

        const body = {
            commandPrefix: "!github",
            org: orgId,
            repo: repoId,
        };
        return await this.doProvisionRequest<HookshotGithubRoomConfig>(bridge, "PUT", `/v1/${roomId}/connections/${HookshotTypes.Github}`, null, body);
    }

    public async unbridgeRoom(roomId: string, connectionId: string): Promise<void> {
        const bridge = await this.getDefaultBridge();
        await this.doProvisionRequest(bridge, "DELETE", `/v1/${roomId}/connections/${connectionId}`);
    }
}
