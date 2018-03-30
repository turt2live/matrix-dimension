import { FormParam, HeaderParam, Path, PathParam, POST } from "typescript-rest";
import Webhook from "../../db/models/Webhook";
import { ApiError } from "../ApiError";
import * as request from "request";
import { LogService } from "matrix-js-snippets";

@Path("/api/v1/dimension/webhooks")
export class DimensionWebhookService {

    @POST
    @Path("/travisci/:webhookId")
    public async postTravisCiWebhook(@PathParam("webhookId") webhookId: string, @FormParam("payload") payload: string, @HeaderParam("Signature") signature: string): Promise<any> {
        const webhook = await Webhook.findByPrimary(webhookId).catch(() => null);
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
}