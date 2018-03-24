import { NebConfig } from "../models/neb";
import { AppserviceStore } from "../db/AppserviceStore";
import { Client } from "./models/client";
import config from "../config";
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
        const nebRequest: Client = {
            UserID: userId,
            HomeserverURL: config.homeserver.clientServerUrl,
            AccessToken: (isEnabled ? await this.getAccessToken(userId) : "DISABLED"),
            Sync: isEnabled ? sync : false,
            AutoJoinRooms: autoAcceptInvites
        };

        return this.doRequest("/admin/configureClient", nebRequest);
    }

    public async setServiceConfig(serviceId: string, userId: string, type: string, serviceConfig: any): Promise<any> {
        const nebRequest: Service = {
            ID: serviceId,
            Type: type,
            UserID: userId,
            Config: serviceConfig,
        };

        return this.doRequest("/admin/configureService", nebRequest);
    }

    public async getServiceConfig(serviceId: string): Promise<any> {
        const nebRequest = {ID: serviceId};

        try {
            const service = await this.doRequest<Service>("/admin/getService", nebRequest);
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