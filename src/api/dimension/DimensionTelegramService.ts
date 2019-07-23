import { Context, DELETE, GET, Path, PathParam, POST, QueryParam, Security, ServiceContext } from "typescript-rest";
import { TelegramBridge } from "../../bridges/TelegramBridge";
import { ApiError } from "../ApiError";
import { ROLE_USER } from "../security/MatrixSecurity";

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

    @Context
    private context: ServiceContext;

    @GET
    @Path("chat/:chatId")
    @Security(ROLE_USER)
    public async getPortalInfo(@PathParam("chatId") chatId: number, @QueryParam("roomId") roomId: string): Promise<PortalInfoResponse> {
        const userId = this.context.request.user.userId;

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
    @Security(ROLE_USER)
    public async bridgeRoom(@PathParam("chatId") chatId: number, @PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<PortalInfoResponse> {
        const userId = this.context.request.user.userId;

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
    @Security(ROLE_USER)
    public async unbridgeRoom(@PathParam("roomId") roomId: string): Promise<PortalInfoResponse> {
        const userId = this.context.request.user.userId;

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