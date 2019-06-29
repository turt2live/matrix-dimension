import { Observable } from "rxjs/Observable";
import { SessionStorage } from "../SessionStorage";
import { HttpClient } from "@angular/common/http";

export class AuthedApi {
    constructor(protected http: HttpClient) {
    }

    protected authedGet<T>(url: string, qs?: any): Observable<T> {
        if (!qs) qs = {};
        qs["scalar_token"] = SessionStorage.scalarToken;
        return this.http.get<T>(url, {params: qs});
    }

    protected authedPost<T>(url: string, body?: any): Observable<T> {
        if (!body) body = {};
        const qs = {scalar_token: SessionStorage.scalarToken};
        return this.http.post<T>(url, body, {params: qs});
    }

    protected authedDelete<T>(url: string, qs?: any): Observable<T> {
        if (!qs) qs = {};
        qs["scalar_token"] = SessionStorage.scalarToken;
        return this.http.delete<T>(url, {params: qs});
    }
}
