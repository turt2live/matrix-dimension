import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_PortalInfo } from "../../models/telegram";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class TelegramApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getPortalInfo(chatId: number, roomId: string): Promise<FE_PortalInfo> {
        return this.authedGet<FE_PortalInfo>("/api/v1/dimension/telegram/chat/" + chatId, {roomId: roomId}).toPromise();
    }

    public bridgeRoom(roomId: string, chatId: number, unbridgeOtherPortals = false): Promise<FE_PortalInfo> {
        return this.authedPost<FE_PortalInfo>("/api/v1/dimension/telegram/chat/" + chatId + "/room/" + roomId, {unbridgeOtherPortals}).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<FE_PortalInfo> {
        return this.authedDelete<FE_PortalInfo>("/api/v1/dimension/telegram/room/" + roomId).toPromise();
    }
}