import { DELETE, GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import { BridgedChannel, SlackBridge } from "../../bridges/SlackBridge";
import { SlackChannel, SlackTeam } from "../../bridges/models/slack";
import { AutoWired, Inject } from "typescript-ioc/es6";
import AccountController from "../controllers/AccountController";

interface BridgeRoomRequest {
    teamId: string;
    channelId: string;
}

/**
 * API for interacting with the Slack bridge
 */
@Path("/api/v1/dimension/slack")
@AutoWired
export class DimensionSlackService {

    @Inject
    private accountController: AccountController;

    @GET
    @Path("room/:roomId/link")
    public async getLink(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<BridgedChannel> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

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
    public async bridgeRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<BridgedChannel> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

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
    public async unbridgeRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<any> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

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
    public async getTeams(@QueryParam("scalar_token") scalarToken: string): Promise<SlackTeam[]> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

        const slack = new SlackBridge(userId);
        const teams = await slack.getTeams();
        if (!teams) throw new ApiError(404, "No teams found");
        return teams;
    }

    @GET
    @Path("teams/:teamId/channels")
    public async getChannels(@QueryParam("scalar_token") scalarToken: string, @PathParam("teamId") teamId: string): Promise<SlackChannel[]> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

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
    public async getAuthUrl(@QueryParam("scalar_token") scalarToken: string): Promise<{ authUrl: string }> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

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