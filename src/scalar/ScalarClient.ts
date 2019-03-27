import { OpenId } from "../models/OpenId";
import { ScalarRegisterResponse } from "../models/ScalarResponses";
import * as request from "request";
import { LogService } from "matrix-js-snippets";
import Upstream from "../db/models/Upstream";
import { SCALAR_API_VERSION } from "../utils/common-constants";

export class ScalarClient {
    constructor(private upstream: Upstream) {
    }

    public register(openId: OpenId): Promise<ScalarRegisterResponse> {
        LogService.info("ScalarClient", "Doing upstream scalar request: " + this.upstream.scalarUrl + "/register");
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: this.upstream.scalarUrl + "/register",
                qs: {v: SCALAR_API_VERSION},
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
}