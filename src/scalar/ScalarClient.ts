import { OpenId } from "../models/OpenId";
import { ScalarAccountResponse, ScalarLogoutResponse, ScalarRegisterResponse } from "../models/ScalarResponses";
import * as request from "request";
import { LogService } from "matrix-js-snippets";
import Upstream from "../db/models/Upstream";
import { SCALAR_API_VERSION } from "../utils/common-constants";
import { ITermsNotSignedResponse } from "../api/controllers/TermsController";

const REGISTER_ROUTE = "/register";
const ACCOUNT_INFO_ROUTE = "/account";
const LOGOUT_ROUTE = "/logout";
const TERMS_ROUTE = "/terms";

export class ScalarClient {
    public static readonly KIND_LEGACY = "legacy";
    public static readonly KIND_MATRIX_V1 = "matrix_v1";

    constructor(private upstream: Upstream, private kind = ScalarClient.KIND_LEGACY) {
    }

    private makeRequestArguments(path: string, token: string): { scalarUrl: string, headers: any, queryString: any } {
        if (this.kind === ScalarClient.KIND_LEGACY) {
            const addlQuery = {};
            if (token) addlQuery['scalar_token'] = token;
            return {
                scalarUrl: this.upstream.scalarUrl + path,
                headers: {},
                queryString: {
                    v: SCALAR_API_VERSION,
                    ...addlQuery,
                },
            };
        } else {
            const parsed = new URL(this.upstream.scalarUrl);
            if (path === ACCOUNT_INFO_ROUTE || path === TERMS_ROUTE) {
                parsed.pathname = `/_matrix/integrations/v1${path}`;
            } else {
                parsed.pathname = `/_matrix/integrations/v1${ACCOUNT_INFO_ROUTE}${path}`;
            }

            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            return {
                scalarUrl: parsed.toString(),
                headers: headers,
                queryString: {},
            };
        }
    }

    public register(openId: OpenId): Promise<ScalarRegisterResponse> {
        const {scalarUrl, headers, queryString} = this.makeRequestArguments(REGISTER_ROUTE, null);
        LogService.info("ScalarClient", "Doing upstream scalar request: " + scalarUrl);
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: scalarUrl,
                qs: queryString,
                headers: headers,
                json: openId,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("ScalarClient", "Error registering for token");
                    LogService.error("ScalarClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("ScalarClient", "Got status code " + res.statusCode + " while registering for token");
                    reject(new Error("Could not get token"));
                } else {
                    resolve(res.body);
                }
            });
        });
    }

    public getAccount(token: string): Promise<ScalarAccountResponse> {
        const {scalarUrl, headers, queryString} = this.makeRequestArguments(ACCOUNT_INFO_ROUTE, token);
        LogService.info("ScalarClient", "Doing upstream scalar request: " + scalarUrl);
        return new Promise((resolve, reject) => {
            request({
                method: "GET",
                url: scalarUrl,
                qs: queryString,
                headers: headers,
                json: true,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("ScalarClient", "Error getting information for token");
                    LogService.error("ScalarClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("ScalarClient", "Got status code " + res.statusCode + " while getting information for token");
                    reject(res.statusCode);
                } else {
                    resolve(res.body);
                }
            });
        });
    }

    public logout(token: string): Promise<ScalarLogoutResponse> {
        const {scalarUrl, headers, queryString} = this.makeRequestArguments(LOGOUT_ROUTE, token);
        LogService.info("ScalarClient", "Doing upstream scalar request: " + scalarUrl);
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: scalarUrl,
                qs: queryString,
                headers: headers,
                json: true,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("ScalarClient", "Error logging out token");
                    LogService.error("ScalarClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("ScalarClient", "Got status code " + res.statusCode + " while logging out token");
                    reject(res.statusCode);
                } else {
                    resolve(res.body);
                }
            });
        });
    }

    public getMissingTerms(token: string): Promise<ITermsNotSignedResponse> {
        const {scalarUrl, headers, queryString} = this.makeRequestArguments(TERMS_ROUTE, token);
        LogService.info("ScalarClient", "Doing upstream scalar request: GET " + scalarUrl);
        return new Promise((resolve, reject) => {
            request({
                method: "GET",
                url: scalarUrl,
                qs: queryString,
                headers: headers,
                json: true,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("ScalarClient", "Error getting terms for token");
                    LogService.error("ScalarClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("ScalarClient", "Got status code " + res.statusCode + " while getting terms for token");
                    reject(res.statusCode);
                } else {
                    resolve(res.body);
                }
            });
        });
    }

    public signTermsUrls(token: string, urls: string[]): Promise<any> {
        const {scalarUrl, headers, queryString} = this.makeRequestArguments(TERMS_ROUTE, token);
        LogService.info("ScalarClient", "Doing upstream scalar request: POST " + scalarUrl);
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: scalarUrl,
                qs: queryString,
                headers: headers,
                json: {user_accepts: urls},
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("ScalarClient", "Error updating terms for token");
                    LogService.error("ScalarClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("ScalarClient", "Got status code " + res.statusCode + " while updating terms for token");
                    reject(res.statusCode);
                } else {
                    resolve(res.body);
                }
            });
        });
    }
}