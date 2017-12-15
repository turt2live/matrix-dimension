import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Integration } from "./models/integration";

@Injectable()
export class ApiService {
    constructor(private http: Http) {
    }

    checkScalarToken(scalarToken: string): Promise<boolean> {
        return this.http.get("/api/v1/scalar/checkToken", {params: {scalar_token: scalarToken}})
            .map(res => res.status === 200).toPromise();
    }

    getTokenOwner(scalarToken: String): Promise<string> {
        return this.http.get("/api/v1/dimension/whoami", {params:{scalar_token:scalarToken}})
            .map(res => res.status === 200 ? res.json()["userId"] : null).toPromise();
    }

    getIntegrations(roomId: string, scalarToken: string): Promise<Integration[]> {
        return this.http.get("/api/v1/dimension/integrations/" + roomId, {params: {scalar_token: scalarToken}})
            .map(res => res.json()).toPromise();
    }

    removeIntegration(roomId: string, type: string, integrationType: string, scalarToken: string): Promise<any> {
        const url = "/api/v1/dimension/integrations/" + roomId + "/" + type + "/" + integrationType;
        return this.http.delete(url, {params: {scalar_token: scalarToken}})
            .map(res => res.json()).toPromise();
    }

    updateIntegrationState(roomId: string, type: string, integrationType: string, scalarToken: string, newState: any): Promise<any> {
        const url = "/api/v1/dimension/integrations/" + roomId + "/" + type + "/" + integrationType + "/state";
        return this.http.put(url, {scalar_token: scalarToken, state: newState})
            .map(res => res.json()).toPromise();
    }

    getIntegrationState(roomId: string, type: string, integrationType: string, scalarToken: string): Promise<any> {
        const url = "/api/v1/dimension/integrations/" + roomId + "/" + type + "/" + integrationType + "/state";
        return this.http.get(url, {params: {scalar_token: scalarToken}})
            .map(res => res.json()).toPromise();
    }

    isEmbeddable(checkUrl: string): Promise<any> {
        const url = "/api/v1/dimension/widgets/embeddable";
        return this.http.get(url, {params: {url: checkUrl}})
            .map(res => res.json()).toPromise();
    }

    getIntegration(type: string, integrationType: string): Promise<Integration> {
        const url = "/api/v1/dimension/integration/" + type + "/" + integrationType;
        return this.http.get(url).map(res => res.json()).toPromise();
    }
}
