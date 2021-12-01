import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-bot-sdk";
import { BridgedChannel, SlackBridge } from "../../bridges/SlackBridge";
import { SlackChannel, SlackTeam } from "../../bridges/models/slack";
import { ROLE_USER } from "../security/MatrixSecurity";
import { HookshotJiraBridge } from "../../bridges/HookshotJiraBridge";
import {
    HookshotConnection,
    HookshotJiraInstance,
    HookshotJiraProject,
    HookshotJiraRoomConfig
} from "../../bridges/models/hookshot";

interface BridgeRoomRequest {
    instanceName: string;
    projectKey: string;
}

/**
 * API for interacting with the Hookshot/Jira bridge
 */
@Path("/api/v1/dimension/hookshot/jira")
export class DimensionHookshotJiraService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("auth")
    @Security(ROLE_USER)
    public async getAuthUrl(): Promise<{ authUrl: string }> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotJiraBridge(userId);
            const authUrl = await hookshot.getAuthUrl();
            return {authUrl};
        } catch (e) {
            LogService.error("DimensionHookshotJiraService", e);
            throw new ApiError(400, "Error getting auth info");
        }
    }

    @GET
    @Path("instances")
    @Security(ROLE_USER)
    public async getInstances(): Promise<{ instances: HookshotJiraInstance[] }> {
        const userId = this.context.request.user.userId;

        const hookshot = new HookshotJiraBridge(userId);
        const userInfo = await hookshot.getLoggedInUserInfo();
        if (!userInfo.loggedIn) {
            throw new ApiError(403, "Not logged in", "T2B_NOT_LOGGED_IN");
        }
        return {instances: userInfo.instances};
    }

    @GET
    @Path("instance/:instanceName/projects")
    @Security(ROLE_USER)
    public async getProjects(@PathParam("instanceName") instanceName: string): Promise<{ projects: HookshotJiraProject[] }> {
        const userId = this.context.request.user.userId;

        const hookshot = new HookshotJiraBridge(userId);
        const projects = await hookshot.getProjects(instanceName);
        return {projects};
    }

    @POST
    @Path("room/:roomId/connect")
    @Security(ROLE_USER)
    public async bridgeRoom(@PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<HookshotJiraRoomConfig> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotJiraBridge(userId);
            return hookshot.bridgeRoom(roomId, request.instanceName, request.projectKey);
        } catch (e) {
            LogService.error("DimensionHookshotJiraService", e);
            throw new ApiError(400, "Error bridging room");
        }
    }

    @DELETE
    @Path("room/:roomId/connections/all")
    @Security(ROLE_USER)
    public async unbridgeRoom(@PathParam("roomId") roomId: string): Promise<any> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotJiraBridge(userId);
            const connections = await hookshot.getRoomConfigurations(roomId);
            for (const conn of connections) {
                await hookshot.unbridgeRoom(roomId, conn.id);
            }
            return {}; // 200 OK
        } catch (e) {
            LogService.error("DimensionHookshotJiraService", e);
            throw new ApiError(400, "Error unbridging room");
        }
    }
}
