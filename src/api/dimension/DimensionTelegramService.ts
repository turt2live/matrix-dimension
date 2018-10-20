import { DELETE, GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import { TelegramBridge } from "../../bridges/TelegramBridge";
import { ApiError } from "../ApiError";

interface PortalInfoResponse {
    bridged: boolean;
    chatId: number;
    roomId: string;
    canUnbridge: boolean;
    chatName: string;
}

interface BridgeRoomRequest {
    unbridgeOtherPortals: boolean;
}

/**
 * API for interacting with the Telegram bridge
 */
@Path("/api/v1/dimension/telegram")
export class DimensionTelegramService {

    @GET
    @Path("chat/:chatId")
    public async getPortalInfo(@QueryParam("scalar_token") scalarToken: string, @PathParam("chatId") chatId: number, @QueryParam("roomId") roomId: string): Promise<PortalInfoResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        try {
            const telegram = new TelegramBridge(userId);
            const conf = await telegram.getChatConfiguration(chatId, roomId);

            return {
                bridged: conf ? conf.bridged : false,
                canUnbridge: conf ? conf.canUnbridge : false,
                chatId: conf ? conf.chatId : null,
                roomId: conf ? conf.roomId : null,
                chatName: conf ? conf.chatName : null,
            };
        } catch (e) {
            if (e.errcode) {
                throw new ApiError(400, "Error bridging room", e.errcode.toUpperCase());
            } else throw e;
        }
    }

    @POST
    @Path("chat/:chatId/room/:roomId")
    public async bridgeRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("chatId") chatId: number, @PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<PortalInfoResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        try {
            const telegram = new TelegramBridge(userId);
            const portal = await telegram.bridgeRoom(chatId, roomId, request.unbridgeOtherPortals);
            return {
                bridged: true,
                canUnbridge: portal.canUnbridge,
                chatId: portal.chatId,
                roomId: portal.roomId,
                chatName: portal.chatName,
            };
        } catch (e) {
            if (e.errcode) {
                throw new ApiError(400, "Error bridging room", e.errcode.toUpperCase());
            } else throw e;
        }
    }

    @DELETE
    @Path("room/:roomId")
    public async unbridgeRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<PortalInfoResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        try {
            const telegram = new TelegramBridge(userId);
            const portal = await telegram.unbridgeRoom(roomId);
            return {
                bridged: false,
                canUnbridge: portal.canUnbridge,
                chatId: portal.chatId,
                roomId: portal.roomId,
                chatName: portal.chatName,
            };
        } catch (e) {
            if (e.errcode) {
                throw new ApiError(400, "Error bridging room", e.errcode.toUpperCase());
            } else throw e;
        }
    }
}