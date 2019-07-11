import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import { BridgedChannel, SlackBridge } from "../../bridges/SlackBridge";
import { SlackChannel, SlackTeam } from "../../bridges/models/slack";
import { ROLE_USER } from "../security/MatrixSecurity";

interface BridgeRoomRequest {
    teamId: string;
    channelId: string;
}

/**
 * API for interacting with the Slack bridge
 */
@Path("/api/v1/dimension/slack")
export class DimensionSlackService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("room/:roomId/link")
    @Security(ROLE_USER)
    public async getLink(@PathParam("roomId") roomId: string): Promise<BridgedChannel> {
        const userId = this.context.request.user.userId;

        try {
            const slack = new SlackBridge(userId);
            return slack.getLink(roomId);
        } catch (e) {
            LogService.error("DimensionSlackService", e);
            throw new ApiError(400, "Error getting bridge info");
        }
    }

    @POST
    @Path("room/:roomId/link")
    @Security(ROLE_USER)
    public async bridgeRoom(@PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<BridgedChannel> {
        const userId = this.context.request.user.userId;

        try {
            const slack = new SlackBridge(userId);
            await slack.requestEventsLink(roomId, request.teamId, request.channelId);
            return slack.getLink(roomId);
        } catch (e) {
            LogService.error("DimensionSlackService", e);
            throw new ApiError(400, "Error bridging room");
        }
    }

    @DELETE
    @Path("room/:roomId/link")
    public async unbridgeRoom(@PathParam("roomId") roomId: string): Promise<any> {
        const userId = this.context.request.user.userId;

        try {
            const slack = new SlackBridge(userId);
            const link = await slack.getLink(roomId);
            if (link.isWebhook) await slack.removeWebhooksLink(roomId);
            else await slack.removeEventsLink(roomId, link.teamId, link.channelId);
            return {}; // 200 OK
        } catch (e) {
            LogService.error("DimensionSlackService", e);
            throw new ApiError(400, "Error unbridging room");
        }
    }

    @GET
    @Path("teams")
    @Security(ROLE_USER)
    public async getTeams(): Promise<SlackTeam[]> {
        const userId = this.context.request.user.userId;

        const slack = new SlackBridge(userId);
        const teams = await slack.getTeams();
        if (!teams) throw new ApiError(404, "No teams found");
        return teams;
    }

    @GET
    @Path("teams/:teamId/channels")
    @Security(ROLE_USER)
    public async getChannels(@PathParam("teamId") teamId: string): Promise<SlackChannel[]> {
        const userId = this.context.request.user.userId;

        try {
            const slack = new SlackBridge(userId);
            return slack.getChannels(teamId);
        } catch (e) {
            LogService.error("DimensionSlackService", e);
            throw new ApiError(400, "Error getting channel info");
        }
    }

    @GET
    @Path("auth")
    @Security(ROLE_USER)
    public async getAuthUrl(): Promise<{ authUrl: string }> {
        const userId = this.context.request.user.userId;

        try {
            const slack = new SlackBridge(userId);
            const authUrl = await slack.getAuthUrl();
            return {authUrl};
        } catch (e) {
            LogService.error("DimensionSlackService", e);
            throw new ApiError(400, "Error getting auth info");
        }
    }
}