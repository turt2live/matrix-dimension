import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Integration } from "./models/integration";

@Injectable()
export class ApiService {
    constructor(private http: Http) {
    }

    checkScalarToken(token): Promise<boolean> {
        return this.http.get("/api/v1/scalar/checkToken", {params: {scalar_token: token}})
            .map(res => res.status === 200).toPromise();
    }

    getIntegrations(): Promise<Integration[]> {
        return this.http.get("/api/v1/dimension/integrations")
            .map(res => res.json()).toPromise();
    }

    removeIntegration(roomId: string, userId: string, scalarToken: string): Promise<any> {
        return this.http.post("/api/v1/dimension/removeIntegration", {roomId: roomId, userId: userId, scalarToken: scalarToken})
            .map(res => res.json()).toPromise();
    }
}
