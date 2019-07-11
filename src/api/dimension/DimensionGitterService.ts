import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { BridgedRoom, GitterBridge } from "../../bridges/GitterBridge";
import { LogService } from "matrix-js-snippets";
import { ROLE_MSC_USER } from "../security/MSCSecurity";

interface BridgeRoomRequest {
    gitterRoomName: string;
}

/**
 * API for interacting with the Gitter bridge
 */
@Path("/api/v1/dimension/gitter")
export class DimensionGitterService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("room/:roomId/link")
    @Security(ROLE_MSC_USER)
    public async getLink(@PathParam("roomId") roomId: string): Promise<BridgedRoom> {
        const userId = this.context.request.user.userId;
        try {
            const gitter = new GitterBridge(userId);
            return gitter.getLink(roomId);
        } catch (e) {
            LogService.error("DimensionGitterService", e);
            throw new ApiError(400, "Error getting bridge info");
        }
    }

    @POST
    @Path("room/:roomId/link")
    @Security(ROLE_MSC_USER)
    public async bridgeRoom(@PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<BridgedRoom> {
        const userId = this.context.request.user.userId;
        try {
            const gitter = new GitterBridge(userId);
            await gitter.requestLink(roomId, request.gitterRoomName);
            return gitter.getLink(roomId);
        } catch (e) {
            LogService.error("DimensionGitterService", e);
            throw new ApiError(400, "Error bridging room");
        }
    }

    @DELETE
    @Path("room/:roomId/link")
    @Security(ROLE_MSC_USER)
    public async unbridgeRoom(@PathParam("roomId") roomId: string): Promise<any> {
        const userId = this.context.request.user.userId;
        try {
            const gitter = new GitterBridge(userId);
            const link = await gitter.getLink(roomId);
            await gitter.removeLink(roomId, link.gitterRoomName);
            return {}; // 200 OK
        } catch (e) {
            LogService.error("DimensionGitterService", e);
            throw new ApiError(400, "Error unbridging room");
        }
    }
}