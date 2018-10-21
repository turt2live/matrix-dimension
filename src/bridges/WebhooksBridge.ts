import { LogService } from "matrix-js-snippets";
import * as request from "request";
import {
    ListWebhooksResponse,
    SuccessResponse,
    WebhookBridgeInfo,
    WebhookConfiguration,
    WebhookOptions,
    WebhookResponse
} from "./models/webhooks";
import WebhookBridgeRecord from "../db/models/WebhookBridgeRecord";

export class WebhooksBridge {

    constructor(private requestingUserId: string) {
    }

    private async getDefaultBridge(): Promise<WebhookBridgeRecord> {
        const bridges = await WebhookBridgeRecord.findAll({where: {isEnabled: true}});
        if (!bridges || bridges.length !== 1) {
            throw new Error("No bridges or too many bridges found");
        }
        return bridges[0];
    }

    public async isBridgingEnabled(): Promise<boolean> {
        const bridges = await WebhookBridgeRecord.findAll({where: {isEnabled: true}});
        return !!bridges;
    }

    public async getBridgeInfo(): Promise<WebhookBridgeInfo> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<WebhookBridgeInfo>(bridge, "GET", "/api/v1/provision/info");
    }

    public async getHooks(roomId: string): Promise<WebhookConfiguration[]> {
        const bridge = await this.getDefaultBridge();

        try {
            const response = await this.doProvisionRequest<ListWebhooksResponse>(bridge, "GET", `/api/v1/provision/${roomId}/hooks`);
            if (!response.success) throw new Error("Failed to get webhooks");
            return response.results;
        } catch (e) {
            LogService.error("WebhooksBridge", e);
            return [];
        }
    }

    public async createWebhook(roomId: string, options: WebhookOptions): Promise<WebhookConfiguration> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<WebhookResponse>(bridge, "PUT", `/api/v1/provision/${roomId}/hook`, null, options);
    }

    public async updateWebhook(roomId: string, hookId: string, options: WebhookOptions): Promise<WebhookConfiguration> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<WebhookResponse>(bridge, "PUT", `/api/v1/provision/${roomId}/hook/${hookId}`, null, options);
    }

    public async deleteWebhook(roomId: string, hookId: string): Promise<any> {
        const bridge = await this.getDefaultBridge();
        return this.doProvisionRequest<SuccessResponse>(bridge, "DELETE", `/api/v1/provision/${roomId}/hook/${hookId}`);
    }

    private async doProvisionRequest<T>(bridge: WebhookBridgeRecord, method: string, endpoint: string, qs?: any, body?: any): Promise<T> {
        const provisionUrl = bridge.provisionUrl;
        const apiUrl = provisionUrl.endsWith("/") ? provisionUrl.substring(0, provisionUrl.length - 1) : provisionUrl;
        const url = apiUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        LogService.info("WebhooksBridge", "Doing provision Webhooks Bridge request: " + url);

        if (!qs) qs = {};
        if (!qs["userId"]) qs["userId"] = this.requestingUserId;
        qs["token"] = bridge.sharedSecret;

        return new Promise<T>((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                json: body,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("WebhooksBridge", "Error calling" + url);
                    LogService.error("WebhooksBridge", err);
                    reject(err);
                } else if (!res) {
                    LogService.error("WebhooksBridge", "There is no response for " + url);
                    reject(new Error("No response provided - is the service online?"));
                } else if (res.statusCode !== 200) {
                    LogService.error("WebhooksBridge", "Got status code " + res.statusCode + " when calling " + url);
                    LogService.error("WebhooksBridge", res.body);
                    reject(new Error("Request failed"));
                } else {
                    if (typeof(res.body) === "string") res.body = JSON.parse(res.body);
                    resolve(res.body);
                }
            });
        });
    }
}