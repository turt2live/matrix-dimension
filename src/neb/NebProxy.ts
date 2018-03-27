import { NebConfig } from "../models/neb";
import NebIntegration from "../db/models/NebIntegration";
import { NebStore } from "../db/NebStore";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import Upstream from "../db/models/Upstream";
import UserScalarToken from "../db/models/UserScalarToken";
import { NebClient } from "./NebClient";
import { ModularIntegrationInfoResponse } from "../models/ModularResponses";
import { AppserviceStore } from "../db/AppserviceStore";
import { MatrixAppserviceClient } from "../matrix/MatrixAppserviceClient";
import NebIntegrationConfig from "../db/models/NebIntegrationConfig";
import { RssBotConfiguration } from "../integrations/ComplexBot";

export class NebProxy {
    constructor(private neb: NebConfig, private requestingUserId: string) {

    }

    public async getBotUserId(integration: NebIntegration): Promise<string> {
        if (integration.nebId !== this.neb.id) throw new Error("Integration is not for this NEB proxy");

        if (this.neb.upstreamId) {
            try {
                const response = await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/" + NebClient.getNebType(integration.type));
                return response.bot_user_id;
            } catch (err) {
                LogService.error("NebProxy", err);
                return null;
            }
        } else {
            return (await NebStore.getOrCreateBotUser(this.neb.id, integration.type)).appserviceUserId;
        }
    }

    public async getNotificationUserId(integration: NebIntegration, inRoomId: string): Promise<string> {
        if (integration.nebId !== this.neb.id) throw new Error("Integration is not for this NEB proxy");

        if (this.neb.upstreamId) {
            try {
                const response = await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/" + NebClient.getNebType(integration.type), {
                    room_id: inRoomId,
                });
                return response.bot_user_id;
            } catch (err) {
                LogService.error("NebProxy", err);
                return null;
            }
        } else {
            return (await NebStore.getOrCreateNotificationUser(this.neb.id, integration.type, this.requestingUserId)).appserviceUserId;
        }
    }

    public async getServiceConfiguration(integration: NebIntegration, inRoomId: string): Promise<any> {
        if (integration.nebId !== this.neb.id) throw new Error("Integration is not for this NEB proxy");

        if (this.neb.upstreamId) {
            // TODO: Verify
            try {
                const response = await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/" + NebClient.getNebType(integration.type), {
                    room_id: inRoomId,
                });

                if (integration.type === "rss") return this.parseUpstreamRssConfiguration(response.integrations);
                else return {};
            } catch (err) {
                LogService.error("NebProxy", err);
                return {};
            }
        } else {
            const serviceConfig = await NebIntegrationConfig.findOne({
                where: {
                    integrationId: integration.id,
                    roomId: inRoomId,
                },
            });
            return serviceConfig ? JSON.parse(serviceConfig.jsonContent) : {};
        }
    }

    public async setServiceConfiguration(integration: NebIntegration, inRoomId: string, newConfig: any): Promise<any> {
        if (integration.nebId !== this.neb.id) throw new Error("Integration is not for this NEB proxy");

        if (!this.neb.upstreamId) {
            const serviceConfig = await NebIntegrationConfig.findOne({
                where: {
                    integrationId: integration.id,
                    roomId: inRoomId,
                },
            });
            if (serviceConfig) {
                serviceConfig.jsonContent = JSON.stringify(newConfig);
                await serviceConfig.save();
            } else {
                await NebIntegrationConfig.create({
                    integrationId: integration.id,
                    roomId: inRoomId,
                    jsonContent: JSON.stringify(newConfig),
                });
            }
        }

        if (integration.type === "rss") await this.updateRssConfiguration(inRoomId, newConfig);
        else throw new Error("Cannot update go-neb: unrecognized type");
    }

    private parseUpstreamRssConfiguration(integrations: any[]): any {
        if (!integrations) return {};

        const result: RssBotConfiguration = {feeds: {}};
        for (const integration of integrations) {
            const userId = integration.user_id;
            const feeds = integration.config ? integration.config.feeds : {};
            if (!userId || !feeds) continue;

            const urls = Object.keys(feeds);
            urls.forEach(u => result.feeds[u] = {addedByUserId: userId});
        }

        return result;
    }

    private async updateRssConfiguration(roomId: string, newOpts: RssBotConfiguration): Promise<any> {
        const feedUrls = Object.keys(newOpts.feeds).filter(f => newOpts.feeds[f].addedByUserId === this.requestingUserId);
        const newConfig = {feeds: {}};
        let currentConfig = {feeds: {}};

        if (this.neb.upstreamId) {
            const response = await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/rssbot", {room_id: roomId});
            currentConfig = await this.parseUpstreamRssConfiguration(response.integrations);
        } else {
            const client = new NebClient(this.neb);
            const notifUser = await NebStore.getOrCreateNotificationUser(this.neb.id, "rss", this.requestingUserId);
            currentConfig = await client.getServiceConfig(notifUser.serviceId);

            if (feedUrls.length === 0) {
                const appserviceClient = new MatrixAppserviceClient(await AppserviceStore.getAppservice(this.neb.appserviceId));
                await appserviceClient.leaveRoom(notifUser.appserviceUserId, roomId);
            }
        }

        if (!currentConfig || !currentConfig.feeds) currentConfig = {feeds: {}};

        const allUrls = feedUrls.concat(Object.keys(currentConfig.feeds));
        for (const feedUrl of allUrls) {
            let feed = currentConfig.feeds[feedUrl];
            if (!feed) feed = {poll_interval_mins: 60, rooms: []};

            const hasRoom = feed.rooms.indexOf(roomId) !== -1;
            const isEnabled = feedUrls.indexOf(feedUrl) !== -1;

            if (hasRoom && !isEnabled) {
                feed.rooms.splice(feed.rooms.indexOf(roomId), 1);
            } else if (!hasRoom && isEnabled) {
                feed.rooms.push(roomId);
            }

            if (feed.rooms.length > 0) {
                newConfig.feeds[feedUrl] = {
                    poll_interval_mins: feed.poll_interval_mins,
                    rooms: feed.rooms,
                };
            }
        }

        if (this.neb.upstreamId) {
            await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/rssbot/configureService", {
                room_id: roomId,
                feeds: newConfig.feeds,
            });
        } else {
            const client = new NebClient(this.neb);
            const notifUser = await NebStore.getOrCreateNotificationUser(this.neb.id, "rss", this.requestingUserId);
            await client.setServiceConfig(notifUser.serviceId, notifUser.appserviceUserId, "rssbot", newConfig);
        }
    }

    public async removeBotFromRoom(integration: NebIntegration, roomId: string): Promise<any> {
        if (integration.nebId !== this.neb.id) throw new Error("Integration is not for this NEB proxy");

        if (this.neb.upstreamId) {
            await this.doUpstreamRequest("/removeIntegration", {type: integration.type, room_id: roomId});
        } else {
            const appservice = await AppserviceStore.getAppservice(this.neb.appserviceId);
            const client = new MatrixAppserviceClient(appservice);
            await client.leaveRoom(await this.getBotUserId(integration), roomId);
        }
    }

    private async doUpstreamRequest<T>(endpoint: string, body?: any): Promise<T> {
        const upstream = await Upstream.findByPrimary(this.neb.upstreamId);
        const token = await UserScalarToken.findOne({
            where: {
                upstreamId: upstream.id,
                isDimensionToken: false,
                userId: this.requestingUserId,
            },
        });

        const apiUrl = upstream.apiUrl.endsWith("/") ? upstream.apiUrl.substring(0, upstream.apiUrl.length - 1) : upstream.apiUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);

        return new Promise<T>((resolve, reject) => {
            request({
                method: "POST",
                url: url,
                qs: {scalar_token: token.scalarToken},
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("NebProxy", "Error calling" + url);
                    LogService.error("NebProxy", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("NebProxy", "Got status code " + res.statusCode + " when calling " + url);
                    reject(new Error("Request failed"));
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}