import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_IrcBridge } from "../../models/irc";
import { map } from "rxjs/operators";

@Injectable()
export class AdminIrcApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getBridges(): Promise<FE_IrcBridge[]> {
        return this.authedGet("/api/v1/dimension/admin/irc/all")
            .pipe(map(r => r.json())).toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_IrcBridge> {
        return this.authedGet("/api/v1/dimension/admin/irc/" + bridgeId)
            .pipe(map(r => r.json())).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_IrcBridge> {
        return this.authedPost("/api/v1/dimension/admin/irc/new/upstream", {upstreamId: upstream.id})
            .pipe(map(r => r.json())).toPromise();
    }

    public newSelfhosted(provisionUrl: string): Promise<FE_IrcBridge> {
        return this.authedPost("/api/v1/dimension/admin/irc/new/selfhosted", {provisionUrl: provisionUrl})
            .pipe(map(r => r.json())).toPromise();
    }

    public setNetworkEnabled(bridgeId: number, networkId: string, isEnabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/irc/" + bridgeId + "/network/" + networkId + "/enabled", {
            isEnabled: isEnabled,
        }).pipe(map(r => r.json())).toPromise();
    }
}
