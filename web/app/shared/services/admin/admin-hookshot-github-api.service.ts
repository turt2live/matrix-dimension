import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_Upstream } from "../../models/admin-responses";
import { FE_TelegramBridge, FE_TelegramBridgeOptions } from "../../models/telegram";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotGithubBridge } from "../../models/hookshot_github";

@Injectable()
export class AdminHookshotGithubApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBridges(): Promise<FE_HookshotGithubBridge[]> {
        return this.authedGet<FE_HookshotGithubBridge[]>("/api/v1/dimension/admin/hookshot/github/all").toPromise();
    }

    public getBridge(bridgeId: number): Promise<FE_HookshotGithubBridge> {
        return this.authedGet<FE_HookshotGithubBridge>("/api/v1/dimension/admin/hookshot/github/" + bridgeId).toPromise();
    }

    public newFromUpstream(upstream: FE_Upstream): Promise<FE_HookshotGithubBridge> {
        return this.authedPost<FE_HookshotGithubBridge>("/api/v1/dimension/admin/hookshot/github/new/upstream", {upstreamId: upstream.id}).toPromise();
    }

    public newSelfhosted(provisionUrl: string, sharedSecret: string): Promise<FE_HookshotGithubBridge> {
        return this.authedPost<FE_HookshotGithubBridge>("/api/v1/dimension/admin/hookshot/github/new/selfhosted", {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }

    public updateSelfhosted(bridgeId: number, provisionUrl: string, sharedSecret: string): Promise<FE_HookshotGithubBridge> {
        return this.authedPost<FE_TelegramBridge>("/api/v1/dimension/admin/hookshot/github/" + bridgeId, {
            provisionUrl: provisionUrl,
            sharedSecret: sharedSecret,
        }).toPromise();
    }
}
