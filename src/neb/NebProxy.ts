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

    public async getNotificationUserId(integration: NebIntegration, inRoomId: string, forUserId: string): Promise<string> {
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
            return (await NebStore.getOrCreateNotificationUser(this.neb.id, integration.type, forUserId)).appserviceUserId;
        }
    }

    // public async getComplexBotConfiguration(integration: NebIntegration, roomId: string): Promise<any> {
    //
    // }

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