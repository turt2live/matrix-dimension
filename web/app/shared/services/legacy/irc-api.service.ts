import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class IrcApiService {
    constructor(private http: Http) {
    }

    getChannelOps(roomId: string, networkId: string, channel: string, scalarToken: string): Promise<string[]> {
        return this.http.get("/api/v1/irc/" + roomId + "/ops/" + networkId + "/" + channel, {params: {scalar_token: scalarToken}})
            .map(res => res.json()).toPromise();
    }

    linkChannel(roomId: string, networkId: string, channel: string, op: string, scalarToken: string): Promise<any> {
        return this.http.put("/api/v1/irc/" + roomId + "/channels/" + networkId + "/" + channel, {}, {
            params: {
                scalar_token: scalarToken,
                op: op
            }
        }).map(res => res.json()).toPromise();
    }

    unlinkChannel(roomId: string, networkId: string, channel: string, scalarToken: string): Promise<any> {
        return this.http.delete("/api/v1/irc/" + roomId + "/channels/" + networkId + "/" + channel, {params: {scalar_token: scalarToken}})
            .map(res => res.json()).toPromise();
    }
}
