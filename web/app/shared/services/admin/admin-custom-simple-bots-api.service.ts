import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_CustomSimpleBot, FE_CustomSimpleBotTemplate, FE_UserProfile } from "../../models/admin-responses";
import { map } from "rxjs/operators";

@Injectable()
export class AdminCustomSimpleBotsApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBots(): Promise<FE_CustomSimpleBot[]> {
        return this.authedGet("/api/v1/dimension/admin/bots/simple/custom/all")
            .pipe(map(r => r.json())).toPromise();
    }

    public getBot(id: number): Promise<FE_CustomSimpleBot> {
        return this.authedGet("/api/v1/dimension/admin/bots/simple/custom/" + id)
            .pipe(map(r => r.json())).toPromise();
    }

    public updateBot(id: number, config: FE_CustomSimpleBotTemplate): Promise<FE_CustomSimpleBot> {
        return this.authedPost("/api/v1/dimension/admin/bots/simple/custom/" + id, config)
            .pipe(map(r => r.json())).toPromise();
    }

    public createBot(config: FE_CustomSimpleBotTemplate): Promise<FE_CustomSimpleBot> {
        return this.authedPost("/api/v1/dimension/admin/bots/simple/custom/new", config)
            .pipe(map(r => r.json())).toPromise();
    }

    public getProfile(userId: string): Promise<FE_UserProfile> {
        return this.authedGet("/api/v1/dimension/admin/bots/simple/custom/profile/" + userId)
            .pipe(map(r => r.json())).toPromise();
    }
}
