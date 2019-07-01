import { Observable } from "rxjs/Observable";
import { SessionStorage } from "../SessionStorage";
import { HttpClient } from "@angular/common/http";

export class AuthedApi {
    constructor(protected http: HttpClient, private mscAuth = false) {
    }

    protected authedGet<T>(url: string, qs?: any): Observable<T> {
        const opts = this.fillAuthOptions(null, qs, null);
        return this.http.get<T>(url, opts);
    }

    protected authedPost<T>(url: string, body?: any): Observable<T> {
        if (!body) body = {};
        const opts = this.fillAuthOptions(null, null, null);
        return this.http.post<T>(url, body, opts);
    }

    protected authedDelete<T>(url: string, qs?: any): Observable<T> {
        const opts = this.fillAuthOptions(null, qs, null);
        return this.http.delete<T>(url, opts);
    }

    private fillAuthOptions(opts: any, qs: any, headers: any): { headers: any, params: any } {
        if (!opts) opts = {};
        if (!qs) qs = {};
        if (!headers) headers = {};
        if (this.mscAuth) {
            headers["Authorization"] = `Bearer ${SessionStorage.scalarToken}`;
        } else {
            qs["scalar_token"] = SessionStorage.scalarToken;
        }
        return Object.assign({}, opts, {params: qs, headers: headers});
    }
}
