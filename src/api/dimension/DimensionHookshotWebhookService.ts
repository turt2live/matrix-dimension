import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-bot-sdk";
import { ROLE_USER } from "../security/MatrixSecurity";
import {
    HookshotGithubOrg,
    HookshotGithubRepo,
    HookshotGithubRoomConfig,
    HookshotWebhookRoomConfig
} from "../../bridges/models/hookshot";
import { HookshotGithubBridge } from "../../bridges/HookshotGithubBridge";
import { HookshotWebhookBridge } from "../../bridges/HookshotWebhookBridge";

interface BridgeRoomRequest {
}

/**
 * API for interacting with the Hookshot/Webhook bridge
 */
@Path("/api/v1/dimension/hookshot/webhook")
export class DimensionHookshotWebhookService {

    @Context
    private context: ServiceContext;

    @POST
    @Path("room/:roomId/connect")
    @Security(ROLE_USER)
    public async createWebhook(@PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<HookshotWebhookRoomConfig> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotWebhookBridge(userId);
            return hookshot.newConnection(roomId);
        } catch (e) {
            LogService.error("DimensionHookshotWebhookService", e);
            throw new ApiError(400, "Error bridging room");
        }
    }

    @DELETE
    @Path("room/:roomId/connection/:connectionId/disconnect")
    @Security(ROLE_USER)
    public async removeWebhook(@PathParam("roomId") roomId: string, @PathParam("connectionId") connectionId: string): Promise<any> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotWebhookBridge(userId);
            await hookshot.removeConnection(roomId, connectionId);
            return {}; // 200 OK
        } catch (e) {
            LogService.error("DimensionHookshotWebhookService", e);
            throw new ApiError(400, "Error unbridging room");
        }
    }
}
