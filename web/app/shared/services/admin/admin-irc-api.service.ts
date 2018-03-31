import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_IrcBridge } from "../../models/irc";

@Injectable()
export class AdminIrcApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBridges(): Promise<FE_IrcBridge[]> {
        return this.authedGet("/api/v1/dimension/admin/irc/all").map(r => r.json()).toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_IrcBridge> {
        return this.authedGet("/api/v1/dimension/admin/irc/" + bridgeId).map(r => r.json()).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_IrcBridge> {
        return this.authedPost("/api/v1/dimension/admin/irc/new/upstream", {upstreamId: upstream.id}).map(r => r.json()).toPromise();
    }

    public newSelfhosted(provisionUrl: string): Promise<FE_IrcBridge> {
        return this.authedPost("/api/v1/dimension/admin/irc/new/selfhosted", {provisionUrl: provisionUrl}).map(r => r.json()).toPromise();
    }

    public setNetworkEnabled(bridgeId: number, networkId: string, isEnabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/irc/" + bridgeId + "/network/" + networkId + "/enabled", {
            isEnabled: isEnabled,
        }).map(r => r.json()).toPromise();
    }
}
