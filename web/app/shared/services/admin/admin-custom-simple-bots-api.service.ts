import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_CustomSimpleBot, FE_CustomSimpleBotTemplate, FE_UserProfile } from "../../models/admin-responses";

@Injectable()
export class AdminCustomSimpleBotsApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBots(): Promise<FE_CustomSimpleBot[]> {
        return this.authedGet("/api/v1/dimension/admin/bots/simple/custom/all").map(r => r.json()).toPromise();
    }

    public getBot(id: number): Promise<FE_CustomSimpleBot> {
        return this.authedGet("/api/v1/dimension/admin/bots/simple/custom/" + id).map(r => r.json()).toPromise();
    }

    public updateBot(id: number, config: FE_CustomSimpleBotTemplate): Promise<FE_CustomSimpleBot> {
        return this.authedPost("/api/v1/dimension/admin/bots/simple/custom/" + id, config).map(r => r.json()).toPromise();
    }

    public createBot(config: FE_CustomSimpleBotTemplate): Promise<FE_CustomSimpleBot> {
        return this.authedPost("/api/v1/dimension/admin/bots/simple/custom/new", config).map(r => r.json()).toPromise();
    }

    public getProfile(userId: string): Promise<FE_UserProfile> {
        return this.authedGet("/api/v1/dimension/admin/bots/simple/custom/profile/" + userId).map(r => r.json()).toPromise();
    }
}
