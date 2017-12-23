import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { SessionStorage } from "../SessionStorage";

export class AuthedApi {
    constructor(protected http: Http) {
    }

    protected authedGet(url: string, qs?: any): Observable<Response> {
        if (!qs) qs = {};
        qs["scalar_token"] = SessionStorage.scalarToken;
        return this.http.get(url, {params: qs});
    }
}
