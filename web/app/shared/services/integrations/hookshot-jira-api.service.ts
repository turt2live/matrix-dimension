import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotJiraConnection } from "../../models/hookshot_jira";

@Injectable()
export class HookshotJiraApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public bridgeRoom(roomId: string): Promise<FE_HookshotJiraConnection> {
        return this.authedPost<FE_HookshotJiraConnection>("/api/v1/dimension/hookshot/jira/room/" + roomId + "/connect", {
            // TODO
        }).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/hookshot/jira/" + roomId + "/connections/all").toPromise();
    }
}
