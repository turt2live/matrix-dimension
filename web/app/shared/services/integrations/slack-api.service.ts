import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_SlackChannel, FE_SlackLink, FE_SlackTeam } from "../../models/slack";

@Injectable()
export class SlackApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public bridgeRoom(roomId: string, teamId: string, channelId: string): Promise<FE_SlackLink> {
        return this.authedPost("/api/v1/dimension/slack/room/" + roomId + "/link", {teamId, channelId})
            .map(r => r.json()).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/slack/room/" + roomId + "/link")
            .map(r => r.json()).toPromise();
    }

    public getLink(roomId: string): Promise<FE_SlackLink> {
        return this.authedGet("/api/v1/dimension/slack/room/" + roomId + "/link")
            .map(r => r.json()).toPromise();
    }

    public getTeams(): Promise<FE_SlackTeam[]> {
        return this.authedGet("/api/v1/dimension/slack/teams").map(r => r.json()).toPromise();
    }

    public getChannels(teamId: string): Promise<FE_SlackChannel[]> {
        return this.authedGet("/api/v1/dimension/slack/teams/" + teamId + "/channels").map(r => r.json()).toPromise();
    }

    public getAuthUrl(): Promise<string> {
        return this.authedGet("/api/v1/dimension/slack/auth").map(r => r.json()).toPromise().then(r => r["authUrl"]);
    }
}