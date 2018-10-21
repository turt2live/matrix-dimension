import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_GitterLink } from "../../models/gitter";

@Injectable()
export class GitterApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public bridgeRoom(roomId: string, gitterRoomName: string): Promise<FE_GitterLink> {
        return this.authedPost("/api/v1/dimension/gitter/room/" + roomId + "/link", {gitterRoomName})
            .map(r => r.json()).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/gitter/room/" + roomId + "/link")
            .map(r => r.json()).toPromise();
    }

    public getLink(roomId: string): Promise<FE_GitterLink> {
        return this.authedGet("/api/v1/dimension/gitter/room/" + roomId + "/link")
            .map(r => r.json()).toPromise();
    }
}