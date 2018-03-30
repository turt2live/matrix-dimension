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
import { RssBotConfiguration, TravisCiConfiguration } from "../integrations/ComplexBot";
import Webhook from "../db/models/Webhook";
import * as randomString from "random-string";

interface InternalTravisCiConfig {
    webhookUrl: string;
    rooms: {
        [roomId: string]: {
            [repoKey: string]: {
                template: string;
            };
        };
    };
}

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

        let result = null;
        if (this.neb.upstreamId) {
            try {
                const response = await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/" + NebClient.getNebType(integration.type), {
                    room_id: inRoomId,
                });

                if (integration.type === "rss") result = await this.parseUpstreamRssConfiguration(response.integrations);
                else if (integration.type === "travisci") result = await this.parseUpstreamTravisCiConfiguration(response.integrations);
            } catch (err) {
                LogService.error("NebProxy", err);
            }
        } else {
            const serviceConfig = await NebIntegrationConfig.findOne({
                where: {
                    integrationId: integration.id,
                    roomId: inRoomId,
                },
            });
            result = serviceConfig ? JSON.parse(serviceConfig.jsonContent) : {};
        }

        if (!result) result = {};
        if (integration.type === "travisci") {
            // Replace the webhook ID with the requesting user's webhook ID (generating it if needed)
            result["webhookId"] = await this.getWebhookId(integration.type);
            delete result["webhook_url"];
        }

        return result;
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
        else if (integration.type === "travisci") await this.updateTravisCiConfiguration(inRoomId, newConfig);
        else throw new Error("Cannot update go-neb: unrecognized type");
    }

    private parseUpstreamRssConfiguration(integrations: any[]): RssBotConfiguration {
        if (!integrations) return {feeds: {}};

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

    private parseUpstreamTravisCiConfiguration(integrations: any[]): InternalTravisCiConfig {
        if (!integrations) return {rooms: {}, webhookUrl: null};

        const result: InternalTravisCiConfig = {rooms: {}, webhookUrl: null};
        for (const integration of integrations) {
            if (!integration.user_id || !integration.config || !integration.config.rooms) continue;

            const userId = integration.user_id;
            if (userId === this.requestingUserId && integration.config.webhook_url && !result.webhookUrl)
                result.webhookUrl = integration.config.webhook_url;

            const roomIds = Object.keys(integration.config.rooms);
            for (const roomId of roomIds) {
                if (!result.rooms[roomId]) result.rooms[roomId] = {};

                const repoKeys = Object.keys(integration.config.rooms[roomId].repos || {});
                for (const repoKey of repoKeys) {
                    result.rooms[roomId][repoKey] = {
                        template: integration.config.rooms[roomId].repos[repoKey].template,
                    };
                }
            }
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

    private async updateTravisCiConfiguration(roomId: string, newOpts: TravisCiConfiguration): Promise<any> {
        const repoKeys = Object.keys(newOpts.repos).filter(f => newOpts.repos[f].addedByUserId === this.requestingUserId);
        let newConfig = {rooms: {}};

        if (!this.neb.upstreamId) {
            const notifUser = await NebStore.getOrCreateNotificationUser(this.neb.id, "travisci", this.requestingUserId);
            const client = new NebClient(this.neb);
            newConfig = await client.getServiceConfig(notifUser.serviceId); // So we don't accidentally clear other rooms

            if (repoKeys.length === 0) {
                const appserviceClient = new MatrixAppserviceClient(await AppserviceStore.getAppservice(this.neb.appserviceId));
                await appserviceClient.leaveRoom(notifUser.appserviceUserId, roomId);
            }
        }

        // Reset the current room's configuration so we don't keep artifacts.
        newConfig.rooms[roomId] = {repos: {}};
        const roomReposConf = newConfig.rooms[roomId].repos;

        for (const repoKey of repoKeys) {
            roomReposConf[repoKey] = {
                template: newOpts.repos[repoKey].template,
            };
        }

        if (this.neb.upstreamId) {
            await this.doUpstreamRequest("/integrations/travis-ci/configureService", {
                room_id: roomId,
                rooms: newConfig.rooms,
            });

            // Annoyingly, we don't get any kind of feedback for the webhook - we have to re-request it
            const response = await this.doUpstreamRequest<ModularIntegrationInfoResponse>("/integrations/travis-ci", {
                room_id: roomId,
            });
            const parsed = this.parseUpstreamTravisCiConfiguration(response.integrations);
            if (parsed && parsed.webhookUrl)
                await this.setWebhookTarget("travisci", parsed.webhookUrl);
        } else {
            const client = new NebClient(this.neb);
            const notifUser = await NebStore.getOrCreateNotificationUser(this.neb.id, "travisci", this.requestingUserId);
            const result = await client.setServiceConfig(notifUser.serviceId, notifUser.appserviceUserId, "travis-ci", newConfig);
            if (result['NewConfig'] && result['NewConfig']['webhook_url'])
                await this.setWebhookTarget("travisci", result['NewConfig']['webhook_url']);
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

    private async getWebhookId(serviceId: string): Promise<string> {
        // We add a bit of uniqueness to the service ID to avoid conflicts
        serviceId = serviceId + "_" + this.neb.id;

        let webhook = await Webhook.findOne({
            where: {
                purposeId: serviceId,
                ownerUserId: this.requestingUserId
            }
        }).catch(() => null);
        if (!webhook) {
            webhook = await Webhook.create({
                hookId: randomString({length: 160}),
                ownerUserId: this.requestingUserId,
                purposeId: serviceId,
                targetUrl: null, // Will be populated later
            });
        }

        return webhook.hookId;
    }

    private async setWebhookTarget(serviceId: string, targetUrl: string): Promise<any> {
        const webhookId = await this.getWebhookId(serviceId);
        const webhook = await Webhook.findByPrimary(webhookId);
        webhook.targetUrl = targetUrl;
        return webhook.save();
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
                    LogService.error("NebProxy", res.body);
                    reject(new Error("Request failed"));
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}