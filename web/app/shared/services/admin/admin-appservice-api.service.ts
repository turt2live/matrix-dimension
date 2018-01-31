import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../AuthedApi";
import { FE_Appservice } from "../../models/admin_responses";

@Injectable()
export class AdminAppserviceApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getAppservices(): Promise<FE_Appservice[]> {
        return this.authedGet("/api/v1/dimension/admin/appservices/all").map(r => r.json()).toPromise();
    }

    public createAppservice(userPrefix: string): Promise<FE_Appservice> {
        return this.authedPost("/api/v1/dimension/admin/appservices/new", {userPrefix: userPrefix}).map(r => r.json()).toPromise();
    }
}
