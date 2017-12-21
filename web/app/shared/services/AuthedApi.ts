import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";

export class AuthedApi {
    public static SCALAR_TOKEN: string = null;

    constructor(protected http: Http) {
    }

    protected authedGet(url: string, qs?: any): Observable<Response> {
        if (!qs) qs = {};
        qs["scalar_token"] = AuthedApi.SCALAR_TOKEN;
        return this.http.get(url, {params: qs});
    }
}
