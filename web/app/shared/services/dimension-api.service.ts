import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "./AuthedApi";
import { DimensionIntegrationsResponse } from "../models/dimension_responses";

@Injectable()
export class DimensionApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getIntegrations(roomId: string): Promise<DimensionIntegrationsResponse> {
        return this.authedGet("/api/v1/dimension/integrations/room/" + roomId).map(r => r.json()).toPromise();
    }
}
