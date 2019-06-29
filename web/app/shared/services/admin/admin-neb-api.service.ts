import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Appservice, FE_NebConfiguration, FE_Upstream } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminNebApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getConfigurations(): Promise<FE_NebConfiguration[]> {
        return this.authedGet<FE_NebConfiguration[]>("/api/v1/dimension/admin/neb/all").toPromise();
    }

    public getConfiguration(nebId: number): Promise<FE_NebConfiguration> {
        return this.authedGet<FE_NebConfiguration>("/api/v1/dimension/admin/neb/" + nebId + "/config").toPromise();
    }

    public newUpstreamConfiguration(upstream: FE_Upstream): Promise<FE_NebConfiguration> {
        return this.authedPost<FE_NebConfiguration>("/api/v1/dimension/admin/neb/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newAppserviceConfiguration(adminUrl: string, appservice: FE_Appservice): Promise<FE_NebConfiguration> {
        return this.authedPost<FE_NebConfiguration>("/api/v1/dimension/admin/neb/new/appservice", {
            adminUrl: adminUrl,
            appserviceId: appservice.id
        }).toPromise();
    }

    public toggleIntegration(nebId: number, integrationType: string, setEnabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/neb/" + nebId + "/integration/" + integrationType + "/enabled", {enabled: setEnabled}).toPromise();
    }

    public setIntegrationConfiguration(nebId: number, integrationType: string, configuration: any): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/neb/" + nebId + "/integration/" + integrationType + "/config", configuration).toPromise();
    }

    public getIntegrationConfiguration(nebId: number, integrationType: string): Promise<any> {
        return this.authedGet("/api/v1/dimension/admin/neb/" + nebId + "/integration/" + integrationType + "/config").toPromise();
    }
}
