import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotJiraBridge } from "../../models/hookshot_jira";

@Injectable()
export class AdminHookshotJiraApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBridges(): Promise<FE_HookshotJiraBridge[]> {
        return this.authedGet<FE_HookshotJiraBridge[]>("/api/v1/dimension/admin/hookshot/jira/all").toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_HookshotJiraBridge> {
        return this.authedGet<FE_HookshotJiraBridge>("/api/v1/dimension/admin/hookshot/jira/" + bridgeId).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_HookshotJiraBridge> {
        return this.authedPost<FE_HookshotJiraBridge>("/api/v1/dimension/admin/hookshot/jira/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newSelfhosted(provisionUrl: string, sharedSecret: string): Promise<FE_HookshotJiraBridge> {
        return this.authedPost<FE_HookshotJiraBridge>("/api/v1/dimension/admin/hookshot/jira/new/selfhosted", {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string, sharedSecret: string): Promise<FE_HookshotJiraBridge> {
        return this.authedPost<FE_HookshotJiraBridge>("/api/v1/dimension/admin/hookshot/jira/" + bridgeId, {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }
}
