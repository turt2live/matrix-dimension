import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { HttpClient } from "@angular/common/http";
import { FE_HookshotJiraConnection, FE_HookshotJiraInstance, FE_HookshotJiraProject } from "../../models/hookshot_jira";

@Injectable()
export class HookshotJiraApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getProjects(instanceName: string): Promise<FE_HookshotJiraProject[]> {
        return this.authedGet("/api/v1/dimension/hookshot/jira/instance/" + instanceName + "/projects").toPromise().then(r => r['projects']);
    }

    public getInstances(): Promise<FE_HookshotJiraInstance[]> {
        return this.authedGet("/api/v1/dimension/hookshot/jira/instances").toPromise().then(r => r['instances']);
    }

    public getAuthUrl(): Promise<string> {
        return this.authedGet("/api/v1/dimension/hookshot/jira/auth").toPromise().then(r => r['authUrl']);
    }

    public bridgeRoom(roomId: string, instanceName: string, projectKey: string): Promise<FE_HookshotJiraConnection> {
        return this.authedPost<FE_HookshotJiraConnection>("/api/v1/dimension/hookshot/jira/room/" + roomId + "/connect", {
            instanceName: instanceName,
            projectKey: projectKey,
        }).toPromise();
    }

    public unbridgeRoom(roomId: string): Promise<any> {
        return this.authedDelete("/api/v1/dimension/hookshot/jira/room/" + roomId + "/connections/all").toPromise();
    }
}
