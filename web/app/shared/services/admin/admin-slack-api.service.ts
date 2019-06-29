import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_SlackBridge } from "../../models/slack";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminSlackApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBridges(): Promise<FE_SlackBridge[]> {
        return this.authedGet<FE_SlackBridge[]>("/api/v1/dimension/admin/slack/all").toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_SlackBridge> {
        return this.authedGet<FE_SlackBridge>("/api/v1/dimension/admin/slack/" + bridgeId).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_SlackBridge> {
        return this.authedPost<FE_SlackBridge>("/api/v1/dimension/admin/slack/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newSelfhosted(provisionUrl: string): Promise<FE_SlackBridge> {
        return this.authedPost<FE_SlackBridge>("/api/v1/dimension/admin/slack/new/selfhosted", {
            provisionUrl: provisionUrl,
        }).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string): Promise<FE_SlackBridge> {
        return this.authedPost<FE_SlackBridge>("/api/v1/dimension/admin/slack/" + bridgeId, {
            provisionUrl: provisionUrl,
        }).toPromise();
    }
}
