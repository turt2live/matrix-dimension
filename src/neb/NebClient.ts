import { NebConfig } from "../models/neb";
import { AppserviceStore } from "../db/AppserviceStore";
import { Client } from "./models/client";
import config from "../config";
import { getFederationUrl } from "../matrix/helpers";
import { LogService } from "matrix-js-snippets";
import { Service } from "./models/service";
import * as request from "request";

export class NebClient {
    constructor(private neb: NebConfig) {
    }

    private async getAccessToken(userId: string): Promise<string> {
        const user = await AppserviceStore.getOrCreateUser(this.neb.appserviceId, userId);
        return user.accessToken;
    }

    public async updateUser(userId: string, isEnabled: boolean, sync = true, autoAcceptInvites = true): Promise<any> {
        const request: Client = {
            UserID: userId,
            HomeserverURL: await getFederationUrl(config.homeserver.name),
            AccessToken: (isEnabled ? await this.getAccessToken(userId) : "DISABLED"),
            Sync: isEnabled ? sync : false,
            AutoJoinRooms: autoAcceptInvites
        };

        return this.doRequest("/admin/configureClient", request);
    }

    public async setServiceConfig(serviceId: string, userId: string, type: string, config: any): Promise<any> {
        const request: Service = {
            ID: serviceId,
            Type: type,
            UserID: userId,
            Config: config,
        };

        return this.doRequest("/admin/configureService", request);
    }

    public async getServiceConfig(serviceId: string): Promise<any> {
        const request = {ID: serviceId};

        try {
            const service = await this.doRequest<Service>("/admin/getService", request);
            return service.Config;
        } catch (err) {
            LogService.error("NebClient", err);
            return {};
        }
    }

    private doRequest<T>(endpoint: string, body: any): Promise<T> {
        const adminUrl = (this.neb.adminUrl.endsWith("/") ? this.neb.adminUrl.substring(0, this.neb.adminUrl.length - 1) : this.neb.adminUrl);
        if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: adminUrl + endpoint,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("NebClient", "Error performing request");
                    LogService.error("NebClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("NebClient", "Got status code " + res.statusCode + " while performing request");
                    reject(new Error("Request error"));
                } else {
                    resolve(res.body);
                }
            });
        });
    }
}