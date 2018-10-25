import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_SlackBridge } from "../../models/slack";

@Injectable()
export class AdminSlackApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBridges(): Promise<FE_SlackBridge[]> {
        return this.authedGet("/api/v1/dimension/admin/slack/all").map(r => r.json()).toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_SlackBridge> {
        return this.authedGet("/api/v1/dimension/admin/slack/" + bridgeId).map(r => r.json()).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_SlackBridge> {
        return this.authedPost("/api/v1/dimension/admin/slack/new/upstream", {upstreamId: upstream.id}).map(r => r.json()).toPromise();
    }

    public newSelfhosted(provisionUrl: string): Promise<FE_SlackBridge> {
        return this.authedPost("/api/v1/dimension/admin/slack/new/selfhosted", {
            provisionUrl: provisionUrl,
        }).map(r => r.json()).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string): Promise<FE_SlackBridge> {
        return this.authedPost("/api/v1/dimension/admin/slack/" + bridgeId, {
            provisionUrl: provisionUrl,
        }).map(r => r.json()).toPromise();
    }
}
