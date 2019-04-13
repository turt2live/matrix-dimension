import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_IntegrationsResponse } from "../../models/dimension-responses";
import { FE_Integration } from "../../models/integration";
import { map } from "rxjs/operators";

@Injectable()
export class IntegrationsApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getIntegrations(roomId: string): Promise<FE_IntegrationsResponse> {
        return this.authedGet("/api/v1/dimension/integrations/room/" + roomId)
            .pipe(map(r => r.json())).toPromise();
    }

    public getIntegration(category: string, type: string): Promise<FE_Integration> {
        return this.http.get("/api/v1/dimension/integrations/" + category + "/" + type)
            .pipe(map(r => r.json())).toPromise();
    }

    public getIntegrationInRoom(category: string, type: string, roomId: string): Promise<FE_Integration> {
        return this.authedGet("/api/v1/dimension/integrations/room/" + roomId + "/integrations/" + category + "/" + type)
            .pipe(map(r => r.json())).toPromise();
    }

    public setIntegrationConfiguration(category: string, type: string, roomId: string, newConfig: any): Promise<any> {
        return this.authedPost("/api/v1/dimension/integrations/room/" + roomId + "/integrations/" + category + "/" + type + "/config", newConfig)
            .pipe(map(r => r.json())).toPromise();
    }

    public removeIntegration(category: string, type: string, roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/integrations/room/" + roomId + "/integrations/" + category + "/" + type)
            .pipe(map(r => r.json())).toPromise();
    }
}
