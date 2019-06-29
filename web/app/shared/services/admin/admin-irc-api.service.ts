import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_IrcBridge } from "../../models/irc";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminIrcApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBridges(): Promise<FE_IrcBridge[]> {
        return this.authedGet<FE_IrcBridge[]>("/api/v1/dimension/admin/irc/all").toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_IrcBridge> {
        return this.authedGet<FE_IrcBridge>("/api/v1/dimension/admin/irc/" + bridgeId).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_IrcBridge> {
        return this.authedPost<FE_IrcBridge>("/api/v1/dimension/admin/irc/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newSelfhosted(provisionUrl: string): Promise<FE_IrcBridge> {
        return this.authedPost<FE_IrcBridge>("/api/v1/dimension/admin/irc/new/selfhosted", {provisionUrl: provisionUrl}).toPromise();
    }

    public setNetworkEnabled(bridgeId: number, networkId: string, isEnabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/irc/" + bridgeId + "/network/" + networkId + "/enabled", {
            isEnabled: isEnabled,
        }).toPromise();
    }
}
