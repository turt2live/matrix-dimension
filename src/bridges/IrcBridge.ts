import { IrcBridgeConfiguration } from "../integrations/Bridge";
import { Cache, CACHE_IRC_BRIDGE } from "../MemoryCache";
import IrcBridgeRecord from "../db/models/IrcBridgeRecord";
import Upstream from "../db/models/Upstream";
import UserScalarToken from "../db/models/UserScalarToken";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import { QueryNetworksResponse } from "./models/provision_responses";
import { ModularIrcQueryNetworksResponse } from "../models/ModularResponses";
import IrcBridgeNetwork from "../db/models/IrcBridgeNetwork";

interface CachedNetwork {
    ircBridgeId: number;
    bridgeNetworkId: string;
    bridgeUserId: string;
    displayName: string;
    domain: string;
    isEnabled: boolean;
}

export interface AvailableNetworks {
    [networkId: string]: {
        name: string;
        domain: string;
        bridgeUserId: string;
        isEnabled: boolean;
    };
}

export class IrcBridge {
    private static getNetworkId(network: CachedNetwork): string {
        return network.ircBridgeId + "-" + network.bridgeNetworkId;
    }

    public static parseNetworkId(networkId: string): { bridgeId: string, bridgeNetworkId: string } {
        const parts = networkId.split("-");
        const bridgeId = parts.splice(0, 1)[0];
        const bridgeNetworkId = parts.join("-");
        return {bridgeId, bridgeNetworkId};
    }

    constructor(private requestingUserId: string) {
    }

    public async hasNetworks(): Promise<boolean> {
        const allNetworks = (await this.getAllNetworks()).filter(n => n.isEnabled);
        return allNetworks.length > 0;
    }

    public async getNetworks(bridge?: IrcBridgeRecord): Promise<AvailableNetworks> {
        let networks = await this.getAllNetworks();
        if (bridge) networks = networks.filter(n => n.ircBridgeId === bridge.id);

        const available: AvailableNetworks = {};
        networks.forEach(n => available[IrcBridge.getNetworkId(n)] = {
            name: n.displayName,
            domain: n.domain,
            bridgeUserId: n.bridgeUserId,
            isEnabled: n.isEnabled,
        });
        return available;
    }

    public async getRoomConfiguration(requestingUserId: string, inRoomId: string): Promise<IrcBridgeConfiguration> {
        return <any>{requestingUserId, inRoomId};
    }

    public async setRoomConfiguration(requestingUserId: string, inRoomId: string, newConfig: IrcBridgeConfiguration): Promise<any> {
        return <any>{requestingUserId, inRoomId, newConfig};
    }

    private async getAllNetworks(): Promise<CachedNetwork[]> {
        const cached = Cache.for(CACHE_IRC_BRIDGE).get("networks");
        if (cached) return cached;

        const bridges = await IrcBridgeRecord.findAll();
        if (!bridges) return [];

        const networks: CachedNetwork[] = [];
        for (const bridge of bridges) {
            const bridgeNetworks = await this.fetchNetworks(bridge);
            bridgeNetworks.forEach(n => networks.push(n));
        }

        Cache.for(CACHE_IRC_BRIDGE).put("networks", networks, 60 * 60 * 1000); // 1 hour
        return networks;
    }

    private async fetchNetworks(bridge: IrcBridgeRecord): Promise<CachedNetwork[]> {
        let responses: QueryNetworksResponse[] = [];
        if (bridge.upstreamId) {
            const result = await this.doUpstreamRequest<ModularIrcQueryNetworksResponse>(bridge, "GET", "/bridges/irc/_matrix/provision/querynetworks");
            if (result && result.replies) responses = result.replies.map(r => r.response);
        } else {
            const result = await this.doProvisionRequest<QueryNetworksResponse>(bridge, "GET", "/_matrix/provision/querynetworks");
            if (result) responses = [result];
        }

        const networks: CachedNetwork[] = [];
        for (const response of responses) {
            if (!response || !response.servers) continue;

            for (const server of response.servers) {
                if (!server) continue;

                let existingNetwork = await IrcBridgeNetwork.findOne({
                    where: {
                        bridgeId: bridge.id,
                        bridgeNetworkId: server.network_id,
                    },
                });
                if (!existingNetwork) {
                    LogService.info("IrcBridge", "Discovered new network for bridge " + bridge.id + ": " + server.network_id);
                    existingNetwork = await IrcBridgeNetwork.create({
                        bridgeId: bridge.id,
                        isEnabled: false,
                        bridgeNetworkId: server.network_id,
                        bridgeUserId: server.bot_user_id,
                        displayName: server.desc,
                        domain: server.fields.domain,
                    });
                } else {
                    existingNetwork.displayName = server.desc;
                    existingNetwork.bridgeUserId = server.bot_user_id;
                    existingNetwork.domain = server.fields.domain;
                    await existingNetwork.save();
                }

                networks.push({
                    ircBridgeId: bridge.id,
                    bridgeNetworkId: existingNetwork.bridgeNetworkId,
                    bridgeUserId: existingNetwork.bridgeUserId,
                    displayName: existingNetwork.displayName,
                    domain: existingNetwork.domain,
                    isEnabled: existingNetwork.isEnabled,
                });
            }
        }

        return networks;
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
        LogService.info("IrcBridge", "Doing upstream IRC Bridge request: " + url);

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("IrcBridge", "Error calling" + url);
                    LogService.error("IrcBridge", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("IrcBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("IrcBridge", res.body);
                    reject(new Error("Request failed"));
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
        LogService.info("IrcBridge", "Doing provision IRC Bridge request: " + url);

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("IrcBridge", "Error calling" + url);
                    LogService.error("IrcBridge", err);
                    reject(err);
                    LogService.error("IrcBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("IrcBridge", res.body);
                    reject(new Error("Request failed"));
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}