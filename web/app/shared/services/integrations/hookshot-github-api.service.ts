import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotGithubConnection } from "../../models/hookshot_github";

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
}
