import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotGithubConnection, FE_HookshotGithubOrg, FE_HookshotGithubRepo } from "../../models/hookshot_github";

@Injectable()
export class HookshotGithubApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public bridgeRoom(roomId: string): Promise<FE_HookshotGithubConnection> {
        return this.authedPost<FE_HookshotGithubConnection>("/api/v1/dimension/hookshot/github/room/" + roomId + "/connect", {
            // TODO
        }).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/hookshot/github/room/" + roomId + "/connections/all").toPromise();
    }

    public getAuthUrl(): Promise<string> {
        return this.authedGet("/api/v1/dimension/hookshot/github/auth").toPromise().then(r => r['authUrl']);
    }

    public getOrgs(): Promise<FE_HookshotGithubOrg[]> {
        return this.authedGet("/api/v1/dimension/hookshot/github/orgs").toPromise().then(r => r['orgs']);
    }

    public getRepos(orgId: string): Promise<FE_HookshotGithubRepo[]> {
        return this.authedGet("/api/v1/dimension/hookshot/github/org/" + orgId + "/repos").toPromise().then(r => r['repos']);
    }
}
