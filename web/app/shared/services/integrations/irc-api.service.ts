import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class IrcApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getOperators(networkId: string, channelNoHash: string): Promise<string[]> {
        return this.authedGet<string[]>("/api/v1/dimension/irc/" + networkId + "/channel/" + channelNoHash + "/ops").toPromise();
    }

    public requestLink(roomId: string, networkId: string, channelNoHash: string, op: string): Promise<any> {
        return this.authedPost("/api/v1/dimension/irc/" + networkId + "/channel/" + channelNoHash + "/link/" + roomId, {op: op}).toPromise();
    }

    public removeLink(roomId: string, networkId: string, channelNoHash: string): Promise<any> {
        return this.authedPost("/api/v1/dimension/irc/" + networkId + "/channel/" + channelNoHash + "/unlink/" + roomId).toPromise();
    }
}
