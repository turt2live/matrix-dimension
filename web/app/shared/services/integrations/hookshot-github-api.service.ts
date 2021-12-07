import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import {
    FE_HookshotGithubAuthUrls,
    FE_HookshotGithubConnection,
    FE_HookshotGithubRepo
} from "../../models/hookshot_github";

@Injectable()
export class HookshotGithubApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public bridgeRoom(roomId: string, orgId: string, repoId: string): Promise<FE_HookshotGithubConnection> {
        return this.authedPost<FE_HookshotGithubConnection>("/api/v1/dimension/hookshot/github/room/" + roomId + "/connect", {
            orgId,
            repoId,
        }).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/hookshot/github/room/" + roomId + "/connections/all").toPromise();
    }

    public getAuthUrls(): Promise<FE_HookshotGithubAuthUrls> {
        return this.authedGet<FE_HookshotGithubAuthUrls>("/api/v1/dimension/hookshot/github/auth").toPromise();
    }

    public getKnownRepos(): Promise<FE_HookshotGithubRepo[]> {
        return this.authedGet("/api/v1/dimension/hookshot/github/repos").toPromise().then(r => r['repos']);
    }
}
