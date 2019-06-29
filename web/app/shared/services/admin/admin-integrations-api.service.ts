import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Bridge, FE_Widget } from "../../models/integration";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminIntegrationsApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getAllWidgets(): Promise<FE_Widget[]> {
        return this.authedGet<FE_Widget[]>("/api/v1/dimension/admin/integrations/widget/all").toPromise();
    }

    public getAllBridges(): Promise<FE_Bridge<any>[]> {
        return this.authedGet<FE_Bridge<any>[]>("/api/v1/dimension/admin/integrations/bridge/all").toPromise();
    }

    public toggleIntegration(category: string, type: string, enabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/integrations/" + category + "/" + type + "/enabled", {enabled: enabled}).toPromise();
    }

    public setIntegrationOptions(category: string, type: string, options: any): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/integrations/" + category + "/" + type + "/options", {options: options}).toPromise();
    }
}
