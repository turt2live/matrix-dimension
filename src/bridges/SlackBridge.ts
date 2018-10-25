import IrcBridgeRecord from "../db/models/IrcBridgeRecord";
import Upstream from "../db/models/Upstream";
import UserScalarToken from "../db/models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import { ModularSlackResponse } from "../models/ModularResponses";
import SlackBridgeRecord from "../db/models/SlackBridgeRecord";
import {
    AuthUrlResponse,
    BridgedChannelResponse,
    ChannelsResponse,
    GetBotUserIdResponse,
    SlackChannel,
    SlackTeam,
    TeamsResponse
} from "./models/slack";

export interface SlackBridgeInfo {
    botUserId: string;
}

export interface BridgedChannel {
    roomId: string;
    isWebhook: boolean;
    channelName: string;
    channelId: string;
    teamId: string;
}

export class SlackBridge {

    constructor(private requestingUserId: string) {
    }

    private async getDefaultBridge(): Promise<SlackBridgeRecord> {
        const bridges = await SlackBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }
        return bridges[0];
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await SlackBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges;
    }

    public async getBridgeInfo(): Promise<SlackBridgeInfo> {
        const bridge = await this.getDefaultBridge();

        if (bridge.upstreamId) {
            const info = await this.doUpstreamRequest<ModularSlackResponse<GetBotUserIdResponse>>(bridge, "POST", "/bridges/slack/_matrix/provision/getbotid/", null, {});
            if (!info || !info.replies || !info.replies[0] || !info.replies[0].response) {
                throw new Error("Invalid response from Modular for Slack bot user ID");
            }
            return {botUserId: info.replies[0].response.bot_user_id};
        } else {
            const info = await this.doProvisionRequest<GetBotUserIdResponse>(bridge, "POST", "/_matrix/provision/getbotid");
            return {botUserId: info.bot_user_id};
        }
    }

    public async getLink(roomId: string): Promise<BridgedChannel> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            user_id: this.requestingUserId,
        };
        try {
            if (bridge.upstreamId) {
                delete requestBody["user_id"];
                const link = await this.doUpstreamRequest<ModularSlackResponse<BridgedChannelResponse>>(bridge, "POST", "/bridges/slack/_matrix/provision/getlink", null, requestBody);
                if (!link || !link.replies || !link.replies[0] || !link.replies[0].response) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("Invalid response from Modular for Slack list links in " + roomId);
                }
                return {
                    roomId: link.replies[0].response.matrix_room_id,
                    isWebhook: link.replies[0].response.isWebhook,
                    channelName: link.replies[0].response.slack_channel_name,
                    channelId: link.replies[0].response.slack_channel_id,
                    teamId: link.replies[0].response.team_id,
                };
            } else {
                const link = await this.doProvisionRequest<BridgedChannelResponse>(bridge, "POST", "/_matrix/provision/getlink", null, requestBody);
                return {
                    roomId: link.matrix_room_id,
                    isWebhook: link.isWebhook,
                    channelName: link.slack_channel_name,
                    channelId: link.slack_channel_id,
                    teamId: link.team_id,
                };
            }
        } catch (e) {
            if (e.status === 404) return null;
            LogService.error("SlackBridge", e);
            throw e;
        }
    }

    public async requestEventsLink(roomId: string, teamId: string, channelId: string): Promise<any> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            channel_id: channelId,
            team_id: teamId,
            user_id: this.requestingUserId,
        };

        if (bridge.upstreamId) {
            delete requestBody["user_id"];
            await this.doUpstreamRequest(bridge, "POST", "/bridges/slack/_matrix/provision/link", null, requestBody);
        } else {
            await this.doProvisionRequest(bridge, "POST", "/_matrix/provision/link", null, requestBody);
        }
    }

    public async removeEventsLink(roomId: string, teamId: string, channelId: string): Promise<any> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            channel_id: channelId,
            team_id: teamId,
            user_id: this.requestingUserId,
        };

        if (bridge.upstreamId) {
            delete requestBody["user_id"];
            await this.doUpstreamRequest(bridge, "POST", "/bridges/slack/_matrix/provision/unlink", null, requestBody);
        } else {
            await this.doProvisionRequest(bridge, "POST", "/_matrix/provision/unlink", null, requestBody);
        }
    }

    public async removeWebhooksLink(roomId: string): Promise<any> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            matrix_room_id: roomId,
            user_id: this.requestingUserId,
        };

        if (bridge.upstreamId) {
            delete requestBody["user_id"];
            await this.doUpstreamRequest(bridge, "POST", "/bridges/slack/_matrix/provision/unlink", null, requestBody);
        } else {
            await this.doProvisionRequest(bridge, "POST", "/_matrix/provision/unlink", null, requestBody);
        }
    }

    public async getChannels(teamId: string): Promise<SlackChannel[]> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            team_id: teamId,
            user_id: this.requestingUserId,
        };

        try {
            if (bridge.upstreamId) {
                delete requestBody["user_id"];
                const response = await this.doUpstreamRequest<ModularSlackResponse<ChannelsResponse>>(bridge, "POST", "/bridges/slack/_matrix/provision/channels", null, requestBody);
                if (!response || !response.replies || !response.replies[0] || !response.replies[0].response) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("Invalid response from Modular for Slack get channels of " + teamId);
                }
                return response.replies[0].response.channels;
            } else {
                const response = await this.doProvisionRequest<ChannelsResponse>(bridge, "POST", "/_matrix/provision/channels", null, requestBody);
                return response.channels;
            }
        } catch (e) {
            if (e.status === 404) return null;
            LogService.error("SlackBridge", e);
            throw e;
        }
    }

    public async getTeams(): Promise<SlackTeam[]> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            user_id: this.requestingUserId,
        };

        try {
            if (bridge.upstreamId) {
                delete requestBody["user_id"];
                const response = await this.doUpstreamRequest<ModularSlackResponse<TeamsResponse>>(bridge, "POST", "/bridges/slack/_matrix/provision/teams", null, requestBody);
                if (!response || !response.replies || !response.replies[0] || !response.replies[0].response) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("Invalid response from Modular for Slack get teams for " + this.requestingUserId);
                }
                return response.replies[0].response.teams;
            } else {
                const response = await this.doProvisionRequest<TeamsResponse>(bridge, "POST", "/_matrix/provision/teams", null, requestBody);
                return response.teams;
            }
        } catch (e) {
            if (e.status === 404) return null;
            LogService.error("SlackBridge", e);
            throw e;
        }
    }

    public async getAuthUrl(): Promise<string> {
        const bridge = await this.getDefaultBridge();

        const requestBody = {
            user_id: this.requestingUserId,
        };

        try {
            if (bridge.upstreamId) {
                delete requestBody["user_id"];
                const response = await this.doUpstreamRequest<ModularSlackResponse<AuthUrlResponse>>(bridge, "POST", "/bridges/slack/_matrix/provision/authurl", null, requestBody);
                if (!response || !response.replies || !response.replies[0] || !response.replies[0].response) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("Invalid response from Modular for Slack get auth url for " + this.requestingUserId);
                }
                return response.replies[0].response.auth_uri;
            } else {
                const response = await this.doProvisionRequest<AuthUrlResponse>(bridge, "POST", "/_matrix/provision/authurl", null, requestBody);
                return response.auth_uri;
            }
        } catch (e) {
            if (e.status === 404) return null;
            LogService.error("SlackBridge", e);
            throw e;
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
        LogService.info("SlackBridge", "Doing upstream Slack Bridge request: " + url);

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("SlackBridge", "Error calling " + url);
                    LogService.error("SlackBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("SlackBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200) {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    LogService.error("SlackBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("SlackBridge", res.body);
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
        LogService.info("SlackBridge", "Doing provision Slack Bridge request: " + url);

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("SlackBridge", "Error calling" + url);
                    LogService.error("SlackBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("SlackBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200) {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    LogService.error("SlackBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("SlackBridge", res.body);
                    reject({body: res.body, status: res.statusCode});
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}