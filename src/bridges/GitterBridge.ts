import IrcBridgeRecord from "../db/models/IrcBridgeRecord";
import Upstream from "../db/models/Upstream";
import UserScalarToken from "../db/models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import { ModularGitterResponse } from "../models/ModularResponses";
import GitterBridgeRecord from "../db/models/GitterBridgeRecord";
import { BridgedRoomResponse, GetBotUserIdResponse } from "./models/gitter";

export interface GitterBridgeInfo {
    botUserId: string;
}

export interface BridgedRoom {
    roomId: string;
    gitterRoomName: string;
}

export class GitterBridge {

    constructor(private requestingUserId: string) {
    }

    private async getDefaultBridge(): Promise<GitterBridgeRecord> {
        const bridges = await GitterBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }
        return bridges[0];
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await GitterBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges;
    }

    public async getBridgeInfo(): Promise<GitterBridgeInfo> {
        const bridge = await this.getDefaultBridge();

        if (bridge.upstreamId) {
            const info = await this.doUpstreamRequest<ModularGitterResponse<GetBotUserIdResponse>>(bridge, "POST", "/bridges/gitter/_matrix/provision/getbotid/", null, {});
            if (!info || !info.replies || !info.replies[0] || !info.replies[0].response) {
                throw new Error("Invalid response from Modular for Gitter bot user ID");
            }
            return {botUserId: info.replies[0].response.bot_user_id};
        } else {
            const info = await this.doProvisionRequest<GetBotUserIdResponse>(bridge, "POST", "/_matrix/provision/getbotid");
            return {botUserId: info.bot_user_id};
        }
    }

    public async getLink(roomId: string): Promise<BridgedRoom> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            user_id: this.requestingUserId,
        };
        try {
            if (bridge.upstreamId) {
                delete requestBody["user_id"];
                const link = await this.doUpstreamRequest<ModularGitterResponse<BridgedRoomResponse>>(bridge, "POST", "/bridges/gitter/_matrix/provision/getlink", null, requestBody);
                if (!link || !link.replies || !link.replies[0] || !link.replies[0].response) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("Invalid response from Modular for Gitter list links in " + roomId);
                }
                return {
                    roomId: link.replies[0].response.matrix_room_id,
                    gitterRoomName: link.replies[0].response.remote_room_name,
                };
            } else {
                const link = await this.doProvisionRequest<BridgedRoomResponse>(bridge, "POST", "/_matrix/provision/getlink", null, requestBody);
                return {
                    roomId: link.matrix_room_id,
                    gitterRoomName: link.remote_room_name,
                };
            }
        } catch (e) {
            if (e.status === 404) return null;
            LogService.error("GitterBridge", e);
            throw e;
        }
    }

    public async requestLink(roomId: string, remoteName: string): Promise<any> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            remote_room_name: remoteName,
            user_id: this.requestingUserId,
        };

        if (bridge.upstreamId) {
            delete requestBody["user_id"];
            await this.doUpstreamRequest(bridge, "POST", "/bridges/gitter/_matrix/provision/link", null, requestBody);
        } else {
            await this.doProvisionRequest(bridge, "POST", "/_matrix/provision/link", null, requestBody);
        }
    }

    public async removeLink(roomId: string, remoteName: string): Promise<any> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            remote_room_name: remoteName,
            user_id: this.requestingUserId,
        };

        if (bridge.upstreamId) {
            delete requestBody["user_id"];
            await this.doUpstreamRequest(bridge, "POST", "/bridges/gitter/_matrix/provision/unlink", null, requestBody);
        } else {
            await this.doProvisionRequest(bridge, "POST", "/_matrix/provision/unlink", null, requestBody);
        }
    }

    private async doUpstreamRequest<T>(bridge: IrcBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const upstream = await Upstream.findByPrimary(bridge.upstreamId);
        const token = await UserScalarToken.findOne({
            where: {
                upstreamId: upstream.id,
                isDimensionToken: false,
                userId: this.requestingUserId,
            },
        });

        if (!qs) qs = {};
        qs["scalar_token"] = token.scalarToken;

        const apiUrl = upstream.apiUrl.endsWith("/") ? upstream.apiUrl.substring(0, upstream.apiUrl.length - 1) : upstream.apiUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("GitterBridge", "Doing upstream Gitter Bridge request: " + url);

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("GitterBridge", "Error calling " + url);
                    LogService.error("GitterBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("GitterBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200) {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    LogService.error("GitterBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("GitterBridge", res.body);
                    reject({body: res.body, status: res.statusCode});
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }

    private async doProvisionRequest<T>(bridge: IrcBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const provisionUrl = bridge.provisionUrl;
        const apiUrl = provisionUrl.endsWith("/") ? provisionUrl.substring(0, provisionUrl.length - 1) : provisionUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("GitterBridge", "Doing provision Gitter Bridge request: " + url);

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("GitterBridge", "Error calling" + url);
                    LogService.error("GitterBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("GitterBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200) {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    LogService.error("GitterBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("GitterBridge", res.body);
                    reject({body: res.body, status: res.statusCode});
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}