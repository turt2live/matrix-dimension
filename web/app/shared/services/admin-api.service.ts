import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "./AuthedApi";
import { DimensionConfigResponse, DimensionVersionResponse } from "../models/admin_responses";
import { DimensionIntegrationsResponse } from "../models/dimension_responses";

@Injectable()
export class AdminApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public isAdmin(): Promise<any> {
        return this.authedGet("/api/v1/dimension/admin/check").map(r => r.json()).toPromise();
    }

    public getConfig(): Promise<DimensionConfigResponse> {
        return this.authedGet("/api/v1/dimension/admin/config").map(r => r.json()).toPromise();
    }

    public getVersion(): Promise<DimensionVersionResponse> {
        return this.authedGet("/api/v1/dimension/admin/version").map(r => r.json()).toPromise();
    }

    public getAllIntegrations(): Promise<DimensionIntegrationsResponse> {
        return this.authedGet("/api/v1/dimension/integrations/all").map(r => r.json()).toPromise();
    }

    public toggleIntegration(category: string, type: string, enabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/integrations/" + category + "/" + type + "/enabled", {enabled: enabled}).map(r => r.json()).toPromise();
    }

    public setWidgetOptions(category: string, type: string, options: any): Promise<any> {
        return this.authedPost("/api/v1/dimension/integrations/" + category + "/" + type + "/options", {options: options}).map(r => r.json()).toPromise();
    }
}
