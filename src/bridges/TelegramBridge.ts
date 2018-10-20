import TelegramBridgeRecord from "../db/models/TelegramBridgeRecord";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import {
    BridgeInfoResponse,
    PortalInformationResponse,
    UserChatResponse,
    UserInformationResponse
} from "./models/telegram";

export interface PortalInfo {
    bridged: boolean;
    chatId: number;
    roomId: string;
    canUnbridge: boolean;
    chatName: string;
}

export interface PuppetInfo {
    advertiseTgPuppets: boolean;
    advertiseMxPuppets: boolean;
    linked: boolean;
    telegram: {
        username: string;
        firstName: string;
        lastName: string;
        phone: number;
        isBot: boolean;
        permissions: string[];
        availableChats: {
            id: number;
            title: string;
        }[];
    };
}

export interface BridgeInfo {
    botUsername: string;
}

export class TelegramBridge {
    constructor(private requestingUserId: string) {
    }

    private async getDefaultBridge(): Promise<TelegramBridgeRecord> {
        const bridges = await TelegramBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }

        return bridges[0];
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await TelegramBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges;
    }

    public async getBridgeInfo(): Promise<BridgeInfo> {
        const bridge = await this.getDefaultBridge();

        const info = await this.doProvisionRequest<BridgeInfoResponse>(bridge, "GET", `/bridge`);
        return {
            botUsername: info.relaybot_username,
        };
    }

    public async getPuppetInfo(): Promise<PuppetInfo> {
        const bridge = await this.getDefaultBridge();

        const info = await this.doProvisionRequest<UserInformationResponse>(bridge, "GET", `/user/${this.requestingUserId}`);
        const puppet: PuppetInfo = {
            advertiseTgPuppets: bridge.allowTgPuppets,
            advertiseMxPuppets: bridge.allowMxPuppets,
            linked: !!info.telegram,
            telegram: {
                permissions: [info.permissions],
                username: info.telegram ? info.telegram.username : null,
                firstName: info.telegram ? info.telegram.first_name : null,
                lastName: info.telegram ? info.telegram.last_name : null,
                phone: info.telegram ? info.telegram.phone : null,
                isBot: info.telegram ? info.telegram.is_bot : null,
                availableChats: [], // populated next
            },
        };

        if (puppet.linked) {
            puppet.telegram.availableChats = await this.doProvisionRequest<UserChatResponse[]>(bridge, "GET", `/user/${this.requestingUserId}/chats`);
        }

        return puppet;
    }

    public async getRoomConfiguration(inRoomId: string): Promise<PortalInfo> {
        const bridge = await this.getDefaultBridge();

        try {
            const info = await this.doProvisionRequest<PortalInformationResponse>(bridge, "GET", `/portal/${inRoomId}`);
            return {
                bridged: !!info && info.mxid === inRoomId,
                chatId: info ? info.chat_id : 0,
                roomId: info.mxid,
                chatName: info ? info.title || info.username : null,
                canUnbridge: info ? info.can_unbridge : false,
            };
        } catch (e) {
            if (!e.errBody || e.errBody["errcode"] !== "portal_not_found") {
                throw e.error || e;
            }

            return {
                bridged: false,
                chatId: 0,
                roomId: "",
                chatName: null,
                canUnbridge: false,
            };
        }
    }

    public async getChatConfiguration(chatId: number, roomId: string): Promise<PortalInfo> {
        const bridge = await this.getDefaultBridge();

        try {
            const info = await this.doProvisionRequest<PortalInformationResponse>(bridge, "GET", `/portal/${chatId}`, {room_id: roomId});
            return {
                bridged: info && !!info.mxid,
                chatId: chatId,
                roomId: info ? info.mxid : null,
                chatName: info ? info.title || info.username : null,
                canUnbridge: info ? info.can_unbridge : false,
            };
        } catch (e) {
            if (!e.errBody || e.errBody["errcode"] !== "portal_not_found") {
                throw e.error || e;
            }

            const rethrowCodes = ["bot_not_in_chat"];
            if (rethrowCodes.indexOf(e.errBody["errcode"]) !== -1) {
                throw {errcode: e.errBody["errcode"]};
            }

            return {
                bridged: false,
                chatId: 0,
                roomId: null,
                chatName: null,
                canUnbridge: false,
            };
        }
    }

    public async bridgeRoom(chatId: number, roomId: string, unbridgeOtherPortals = false): Promise<PortalInfo> {
        const bridge = await this.getDefaultBridge();

        try {
            const qs = {};
            if (unbridgeOtherPortals) qs["force"] = "unbridge";
            await this.doProvisionRequest(bridge, "POST", `/portal/${roomId}/connect/${chatId}`, qs);
            return this.getChatConfiguration(chatId, roomId);
        } catch (e) {
            if (!e.errBody) throw e.error || e;

            const rethrowCodes = ["not_enough_permissions", "room_already_bridged", "chat_already_bridged", "bot_not_in_chat"];
            if (rethrowCodes.indexOf(e.errBody["errcode"]) !== -1) {
                throw {errcode: e.errBody["errcode"]};
            }

            throw e.error || e;
        }
    }

    public async unbridgeRoom(roomId: string): Promise<PortalInfo> {
        const bridge = await this.getDefaultBridge();

        try {
            await this.doProvisionRequest(bridge, "POST", `/portal/${roomId}/disconnect`);
            return this.getRoomConfiguration(roomId);
        } catch (e) {
            if (!e.errBody) throw e.error || e;

            const rethrowCodes = ["not_enough_permissions", "bot_not_in_chat"];
            if (rethrowCodes.indexOf(e.errBody["errcode"]) !== -1) {
                throw {errcode: e.errBody["errcode"]};
            }

            throw e.error || e;
        }
    }

    private async doProvisionRequest<T>(bridge: TelegramBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const provisionUrl = bridge.provisionUrl;
        const apiUrl = provisionUrl.endsWith("/") ? provisionUrl.substring(0, provisionUrl.length - 1) : provisionUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("TelegramBridge", "Doing provision Telegram Bridge request: " + url);

        if (!qs) qs = {};

        if (qs["user_id"] === false) delete qs["user_id"];
        else if (!qs["user_id"]) qs["user_id"] = this.requestingUserId;

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
                if (err) {
                    LogService.error("TelegramBridge", "Error calling" + url);
                    LogService.error("TelegramBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("TelegramBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200 && res.statusCode !== 202) {
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