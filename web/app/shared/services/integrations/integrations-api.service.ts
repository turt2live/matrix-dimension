import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_IntegrationsResponse } from "../../models/dimension-responses";
import { FE_Integration } from "../../models/integration";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class IntegrationsApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getIntegrations(roomId: string): Promise<FE_IntegrationsResponse> {
        return this.authedGet<FE_IntegrationsResponse>("/api/v1/dimension/integrations/room/" + roomId).toPromise();
    }

    public getIntegration(category: string, type: string): Promise<FE_Integration> {
        return this.http.get<FE_Integration>("/api/v1/dimension/integrations/" + category + "/" + type).toPromise();
    }

    public getIntegrationInRoom(category: string, type: string, roomId: string): Promise<FE_Integration> {
        return this.authedGet<FE_Integration>("/api/v1/dimension/integrations/room/" + roomId + "/integrations/" + category + "/" + type).toPromise();
    }

    public setIntegrationConfiguration(category: string, type: string, roomId: string, newConfig: any): Promise<any> {
        return this.authedPost("/api/v1/dimension/integrations/room/" + roomId + "/integrations/" + category + "/" + type + "/config", newConfig).toPromise();
    }

    public removeIntegration(category: string, type: string, roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/integrations/room/" + roomId + "/integrations/" + category + "/" + type).toPromise();
    }
}
