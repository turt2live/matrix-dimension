import { LogService } from "matrix-bot-sdk";
import * as request from "request";
import HookshotGithubBridgeRecord from "../db/models/HookshotGithubBridgeRecord";
import {
    HookshotConnection,
    HookshotConnectionsResponse,
    HookshotGithubRoomConfig,
    HookshotTypes
} from "./models/hookshot";

export class HookshotGithubBridge {
    constructor(private requestingUserId: string) {
    }

    private async getDefaultBridge(): Promise<HookshotGithubBridgeRecord> {
        const bridges = await HookshotGithubBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }

        return bridges[0];
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await HookshotGithubBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges && bridges.length > 0;
    }

    public async getRoomConfigurations(inRoomId: string): Promise<HookshotGithubRoomConfig[]> {
        const bridge = await this.getDefaultBridge();

        try {
            const connections = await this.doProvisionRequest<HookshotConnectionsResponse>(bridge, "GET", `/v1/${inRoomId}/connections`);
            return connections.filter(c => c.type === HookshotTypes.Github);
        } catch (e) {
            if (e.errBody['error'] === "Could not determine if the user is in the room.") {
                return [];
            }

            throw e;
        }
    }

    public async bridgeRoom(roomId: string): Promise<HookshotGithubRoomConfig> {
        const bridge = await this.getDefaultBridge();

        const body = {};
        return await this.doProvisionRequest<HookshotConnection>(bridge, "PUT", `/v1/${roomId}/connections/${HookshotTypes.Github}`, null, body);
    }

    public async unbridgeRoom(roomId: string, connectionId: string): Promise<void> {
        const bridge = await this.getDefaultBridge();
        await this.doProvisionRequest(bridge, "DELETE", `/v1/${roomId}/connections/${connectionId}`);
    }

    private async doProvisionRequest<T>(bridge: HookshotGithubBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const provisionUrl = bridge.provisionUrl;
        const apiUrl = provisionUrl.endsWith("/") ? provisionUrl.substring(0, provisionUrl.length - 1) : provisionUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("TelegramBridge", "Doing provision Github Hookshot Bridge request: " + url);

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
                        LogService.error("GithubHookshotBridge", "Error calling" + url);
                        LogService.error("GithubHookshotBridge", err);
                        reject(err);
                    } else if (!res) {
                        LogService.error("GithubHookshotBridge", "There is no response for " + url);
                        reject(new Error("No response provided - is the service online?"));
                    } else if (res.statusCode !== 200 && res.statusCode !== 202) {
                        LogService.error("GithubHookshotBridge", "Got status code " + res.statusCode + " when calling " + url);
                        LogService.error("GithubHookshotBridge", res.body);
                        if (typeof (res.body) === "string") res.body = JSON.parse(res.body);
                        reject({errBody: res.body, error: new Error("Request failed")});
                    } else {
                        if (typeof (res.body) === "string") res.body = JSON.parse(res.body);
                        resolve(res.body);
                    }
                } catch (e) {
                    LogService.error("GithubHookshotBridge", e);
                    reject(e);
                }
            });
        });
    }
}
