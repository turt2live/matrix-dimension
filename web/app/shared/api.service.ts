import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Bot } from "./models/bot";

@Injectable()
export class ApiService {
    constructor(private http: Http) {
    }

    checkScalarToken(token): Promise<boolean> {
        return this.http.get("/api/v1/scalar/checkToken", {params: {scalar_token: token}})
            .map(res => res.status === 200).toPromise();
    }

    getBots(): Promise<Bot[]> {
        return this.http.get("/api/v1/dimension/bots")
            .map(res => res.json()).toPromise();
    }

    kickUser(roomId: string, userId: string, scalarToken: string): Promise<any> {
        return this.http.post("/api/v1/dimension/kick", {roomId: roomId, userId: userId, scalarToken: scalarToken})
            .map(res => res.json()).toPromise();
    }
}
