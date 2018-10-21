import { DELETE, GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import { ApiError } from "../ApiError";
import { BridgedRoom, GitterBridge } from "../../bridges/GitterBridge";
import { LogService } from "matrix-js-snippets";

interface BridgeRoomRequest {
    gitterRoomName: string;
}

/**
 * API for interacting with the Gitter bridge
 */
@Path("/api/v1/dimension/gitter")
export class DimensionGitterService {

    @GET
    @Path("room/:roomId/link")
    public async getLink(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<BridgedRoom> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

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
    public async bridgeRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<BridgedRoom> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

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
    public async unbridgeRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<any> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

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