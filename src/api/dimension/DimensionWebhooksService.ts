import {
    Context,
    DELETE,
    FormParam,
    HeaderParam,
    Path,
    PathParam,
    POST,
    Security,
    ServiceContext
} from "typescript-rest";
import { SuccessResponse, WebhookConfiguration, WebhookOptions } from "../../bridges/models/webhooks";
import { WebhooksBridge } from "../../bridges/WebhooksBridge";
import Webhook from "../../db/models/Webhook";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import * as request from "request";
import { ROLE_MSC_USER } from "../security/MSCSecurity";

/**
 * API for interacting with the Webhooks bridge, and for setting up proxies to other
 * services.
 */
@Path("/api/v1/dimension/webhooks")
export class DimensionWebhooksService {

    @Context
    private context: ServiceContext;

    @POST
    @Path("/travisci/:webhookId")
    public async postTravisCiWebhook(@PathParam("webhookId") webhookId: string, @FormParam("payload") payload: string, @HeaderParam("Signature") signature: string): Promise<any> {
        const webhook = await Webhook.findByPk(webhookId).catch(() => null);
        if (!webhook) throw new ApiError(404, "Webhook not found");
        if (!webhook.targetUrl) throw new ApiError(400, "Webhook not configured");

        return new Promise((resolve, _reject) => {
            request({
                method: "POST",
                url: webhook.targetUrl,
                form: {payload: payload},
                headers: {
                    "Signature": signature,
                },
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("DimensionWebhooksService", "Error invoking travis-ci webhook");
                    LogService.error("DimensionWebhooksService", res.body);

                    throw new ApiError(500, "Internal Server Error");
                } else resolve();
            });
        });
    }

    @POST
    @Path("room/:roomId/webhooks/new")
    @Security(ROLE_MSC_USER)
    public async newWebhook(@PathParam("roomId") roomId: string, options: WebhookOptions): Promise<WebhookConfiguration> {
        const userId = this.context.request.user.userId;
        const webhooks = new WebhooksBridge(userId);
        return webhooks.createWebhook(roomId, options);
    }

    @POST
    @Path("room/:roomId/webhooks/:hookId")
    @Security(ROLE_MSC_USER)
    public async updateWebhook(@PathParam("roomId") roomId: string, @PathParam("hookId") hookId: string, options: WebhookOptions): Promise<WebhookConfiguration> {
        const userId = this.context.request.user.userId;
        const webhooks = new WebhooksBridge(userId);
        return webhooks.updateWebhook(roomId, hookId, options);
    }

    @DELETE
    @Path("room/:roomId/webhooks/:hookId")
    @Security(ROLE_MSC_USER)
    public async deleteWebhook(@PathParam("roomId") roomId: string, @PathParam("hookId") hookId: string): Promise<SuccessResponse> {
        const userId = this.context.request.user.userId;
        const webhooks = new WebhooksBridge(userId);
        return webhooks.deleteWebhook(roomId, hookId);
    }
}