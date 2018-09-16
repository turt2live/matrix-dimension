import { TelegramBridgeConfiguration } from "../integrations/Bridge";
import TelegramBridgeRecord from "../db/models/TelegramBridgeRecord";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import { PortalInformationResponse } from "./models/telegram";

export class TelegramBridge {
    constructor(private requestingUserId: string) {
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await TelegramBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges;
    }

    public async getRoomConfiguration(inRoomId: string): Promise<TelegramBridgeConfiguration> {
        const bridges = await TelegramBridgeRecord.findAll({where: {isEnabled: true}});

        const linkedChats: number[] = [];
        for (const bridge of bridges) {
            try {
                const chatInfo = await this.doProvisionRequest<PortalInformationResponse>(bridge, "GET", `/portal/${inRoomId}`);
                linkedChats.push(chatInfo.chat_id);
            } catch (e) {
                if (!e.errBody || e.errBody["errcode"] !== "portal_not_found") {
                    throw e.error || e;
                }
            }
        }

        return {linkedChatIds: linkedChats};
    }

    private async doProvisionRequest<T>(bridge: TelegramBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const provisionUrl = bridge.provisionUrl;
        const apiUrl = provisionUrl.endsWith("/") ? provisionUrl.substring(0, provisionUrl.length - 1) : provisionUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("TelegramBridge", "Doing provision Telegram Bridge request: " + url);

        if (!qs) qs = {};
        if (!qs["user_id"]) qs["user_id"] = this.requestingUserId;

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("TelegramBridge", "Error calling" + url);
                    LogService.error("TelegramBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("TelegramBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200) {
                    LogService.error("TelegramBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("TelegramBridge", res.body);
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    reject({errBody: res.body, error: new Error("Request failed")});
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}