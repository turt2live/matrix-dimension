import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_CustomSimpleBot, FE_CustomSimpleBotTemplate, FE_UserProfile } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminCustomSimpleBotsApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBots(): Promise<FE_CustomSimpleBot[]> {
        return this.authedGet<FE_CustomSimpleBot[]>("/api/v1/dimension/admin/bots/simple/custom/all").toPromise();
    }

    public getBot(id: number): Promise<FE_CustomSimpleBot> {
        return this.authedGet<FE_CustomSimpleBot>("/api/v1/dimension/admin/bots/simple/custom/" + id).toPromise();
    }

    public updateBot(id: number, config: FE_CustomSimpleBotTemplate): Promise<FE_CustomSimpleBot> {
        return this.authedPost<FE_CustomSimpleBot>("/api/v1/dimension/admin/bots/simple/custom/" + id, config).toPromise();
    }

    public createBot(config: FE_CustomSimpleBotTemplate): Promise<FE_CustomSimpleBot> {
        return this.authedPost<FE_CustomSimpleBot>("/api/v1/dimension/admin/bots/simple/custom/new", config).toPromise();
    }

    public getProfile(userId: string): Promise<FE_UserProfile> {
        return this.authedGet<FE_UserProfile>("/api/v1/dimension/admin/bots/simple/custom/profile/" + userId).toPromise();
    }
}
