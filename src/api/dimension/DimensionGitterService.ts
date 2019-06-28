import { DELETE, GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ApiError } from "../ApiError";
import { BridgedRoom, GitterBridge } from "../../bridges/GitterBridge";
import { LogService } from "matrix-js-snippets";
import { AutoWired, Inject } from "typescript-ioc/es6";
import AccountController from "../controllers/AccountController";

interface BridgeRoomRequest {
    gitterRoomName: string;
}

/**
 * API for interacting with the Gitter bridge
 */
@Path("/api/v1/dimension/gitter")
@AutoWired
export class DimensionGitterService {

    @Inject
    private accountController: AccountController;

    @GET
    @Path("room/:roomId/link")
    public async getLink(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<BridgedRoom> {
        const userId = await this.accountController.getTokenOwner(scalarToken);

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
        const userId = await this.accountController.getTokenOwner(scalarToken);

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
        const userId = await this.accountController.getTokenOwner(scalarToken);

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