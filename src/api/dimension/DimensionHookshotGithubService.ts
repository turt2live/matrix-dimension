import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-bot-sdk";
import { ROLE_USER } from "../security/MatrixSecurity";
import {
    HookshotGithubAuthUrls,
    HookshotGithubOrg,
    HookshotGithubRepo,
    HookshotGithubRoomConfig
} from "../../bridges/models/hookshot";
import { HookshotGithubBridge } from "../../bridges/HookshotGithubBridge";

interface BridgeRoomRequest {
    orgId: string;
    repoId: string;
}

/**
 * API for interacting with the Hookshot/Github bridge
 */
@Path("/api/v1/dimension/hookshot/github")
export class DimensionHookshotGithubService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("auth")
    @Security(ROLE_USER)
    public async getAuthUrl(): Promise<HookshotGithubAuthUrls> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            const authUrls = await hookshot.getAuthUrls();
            return authUrls;
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error getting auth info");
        }
    }

    @GET
    @Path("orgs")
    @Security(ROLE_USER)
    public async getOrgs(): Promise<{ orgs: HookshotGithubOrg[] }> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            const userInfo = await hookshot.getLoggedInUserInfo();
            if (!userInfo.loggedIn) {
                throw new ApiError(403, "Not logged in", "T2B_NOT_LOGGED_IN");
            }
            const repos = await hookshot.getInstalledRepos();
            const orgs = Array.from(new Set(repos.map(r => r.owner))).map(o => ({ name: o, avatarUrl: null }));
            return { orgs: orgs }; // was from userInfo
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error getting org information", "T2B_MISSING_AUTH");
        }
    }

    @GET
    @Path("org/:orgId/repos")
    @Security(ROLE_USER)
    public async getRepos(@PathParam("orgId") orgId: string): Promise<{ repos: HookshotGithubRepo[] }> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            // const repos = await hookshot.getRepos(orgId);
            const repos = await hookshot.getInstalledRepos();
            return {repos: repos.filter(r => r.owner === orgId)};
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error getting repo information", "T2B_MISSING_AUTH");
        }
    }

    @POST
    @Path("room/:roomId/connect")
    @Security(ROLE_USER)
    public async bridgeRoom(@PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<HookshotGithubRoomConfig> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            return hookshot.bridgeRoom(roomId, request.orgId, request.repoId);
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error bridging room");
        }
    }

    @DELETE
    @Path("room/:roomId/connections/all")
    @Security(ROLE_USER)
    public async unbridgeRoom(@PathParam("roomId") roomId: string): Promise<any> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            const connections = await hookshot.getRoomConfigurations(roomId);
            for (const conn of connections) {
                await hookshot.unbridgeRoom(roomId, conn.id);
            }
            return {}; // 200 OK
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error unbridging room");
        }
    }
}
