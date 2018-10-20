import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_PortalInfo } from "../../models/telegram";

@Injectable()
export class TelegramApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getPortalInfo(chatId: number, roomId: string): Promise<FE_PortalInfo> {
        return this.authedGet("/api/v1/dimension/telegram/chat/" + chatId, {roomId: roomId}).map(r => r.json()).toPromise();
    }

    public bridgeRoom(roomId: string, chatId: number, unbridgeOtherPortals = false): Promise<FE_PortalInfo> {
        return this.authedPost("/api/v1/dimension/telegram/chat/" + chatId + "/room/" + roomId, {unbridgeOtherPortals})
            .map(r => r.json()).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<FE_PortalInfo> {
        return this.authedDelete("/api/v1/dimension/telegram/room/" + roomId).map(r => r.json()).toPromise();
    }
}