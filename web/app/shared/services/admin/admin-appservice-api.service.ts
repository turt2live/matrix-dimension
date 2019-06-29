import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Appservice } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminAppserviceApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getAppservices(): Promise<FE_Appservice[]> {
        return this.authedGet<FE_Appservice[]>("/api/v1/dimension/admin/appservices/all").toPromise();
    }

    public getAppservice(appserviceId: string): Promise<FE_Appservice> {
        return this.authedGet<FE_Appservice>("/api/v1/dimension/admin/appservices/" + appserviceId).toPromise();
    }

    public createAppservice(userPrefix: string): Promise<FE_Appservice> {
        return this.authedPost<FE_Appservice>("/api/v1/dimension/admin/appservices/new", {userPrefix: userPrefix})
            .toPromise();
    }

    public test(appserviceId: string): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/appservices/" + appserviceId + "/test").toPromise();
    }
}
