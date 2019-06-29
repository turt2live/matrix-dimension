import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_GitterLink } from "../../models/gitter";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class GitterApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public bridgeRoom(roomId: string, gitterRoomName: string): Promise<FE_GitterLink> {
        return this.authedPost<FE_GitterLink>("/api/v1/dimension/gitter/room/" + roomId + "/link", {gitterRoomName}).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/gitter/room/" + roomId + "/link").toPromise();
    }

    public getLink(roomId: string): Promise<FE_GitterLink> {
        return this.authedGet<FE_GitterLink>("/api/v1/dimension/gitter/room/" + roomId + "/link").toPromise();
    }
}