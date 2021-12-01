import { LogService } from "matrix-bot-sdk";
import * as request from "request";
import {
    HookshotConnectionsResponse, HookshotConnectionTypeDefinition
} from "./models/hookshot";
import { IHookshotBridgeRecord } from "../db/models/IHookshotBridgeRecord";

export abstract class HookshotBridge {
    protected constructor(private requestingUserId: string) {
    }

    protected abstract getDefaultBridge(): Promise<IHookshotBridgeRecord>;

    protected async getAllRoomConfigurations(inRoomId: string): Promise<HookshotConnectionsResponse> {
        const bridge = await this.getDefaultBridge();

        try {
            return await this.doProvisionRequest<HookshotConnectionsResponse>(bridge, "GET", `/v1/${inRoomId}/connections`);
        } catch (e) {
            if (e.errBody['errcode'] === "HS_NOT_IN_ROOM") {
                return [];
            }

            throw e;
        }
    }

    protected async getAllServiceInformation(): Promise<HookshotConnectionTypeDefinition[]> {
        const bridge = await this.getDefaultBridge();
        const connections = await this.doProvisionRequest(bridge, "GET", `/v1/connectiontypes`);
        return Object.values(connections);
    }

    protected async doProvisionRequest<T>(bridge: IHookshotBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const provisionUrl = bridge.provisionUrl;
        const apiUrl = provisionUrl.endsWith("/") ? provisionUrl.substring(0, provisionUrl.length - 1) : provisionUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("HookshotBridge", "Doing provision Hookshot Bridge request: " + url);

        if (!qs) qs = {};

        if (qs["userId"] === false) delete qs["userId"];
        else if (!qs["userId"]) qs["userId"] = this.requestingUserId;

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
                headers: {
                    "Authorization": `Bearer ${bridge.sharedSecret}`,
                },
            }, (err, res, _body) => {
                try {
                    if (err) {
                        LogService.error("HookshotBridge", "Error calling" + url);
                        LogService.error("HookshotBridge", err);
                        reject(err);
                    } else if (!res) {
                        LogService.error("HookshotBridge", "There is no response for " + url);
                        reject(new Error("No response provided - is the service online?"));
                    } else if (res.statusCode !== 200 && res.statusCode !== 202) {
                        LogService.error("HookshotBridge", "Got status code " + res.statusCode + " when calling " + url);
                        LogService.error("HookshotBridge", res.body);
                        if (typeof (res.body) === "string") res.body = JSON.parse(res.body);
                        reject({errBody: res.body, error: new Error("Request failed")});
                    } else {
                        if (typeof (res.body) === "string") res.body = JSON.parse(res.body);
                        resolve(res.body);
                    }
                } catch (e) {
                    LogService.error("HookshotBridge", e);
                    reject(e);
                }
            });
        });
    }
}
