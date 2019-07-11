import { Context, GET, Path, PathParam, POST, QueryParam, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_INTEGRATIONS, CACHE_WEBHOOKS_BRIDGE } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import WebhookBridgeRecord from "../../db/models/WebhookBridgeRecord";
import { ROLE_MSC_ADMIN, ROLE_MSC_USER } from "../security/MSCSecurity";

interface CreateWithUpstream {
    upstreamId: number;
}

interface CreateSelfhosted {
    provisionUrl: string;
    sharedSecret: string;
}

interface BridgeResponse {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
}

/**
 * Administrative API for configuring Webhook bridge instances.
 */
@Path("/api/v1/dimension/admin/webhooks")
export class AdminWebhooksService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getBridges(): Promise<BridgeResponse[]> {
        const bridges = await WebhookBridgeRecord.findAll();
        return Promise.all(bridges.map(async b => {
            return {
                id: b.id,
                upstreamId: b.upstreamId,
                provisionUrl: b.provisionUrl,
                sharedSecret: b.sharedSecret,
                isEnabled: b.isEnabled,
            };
        }));
    }

    @GET
    @Path(":bridgeId")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getBridge(@PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        const webhookBridge = await WebhookBridgeRecord.findByPk(bridgeId);
        if (!webhookBridge) throw new ApiError(404, "Webhook Bridge not found");

        return {
            id: webhookBridge.id,
            upstreamId: webhookBridge.upstreamId,
            provisionUrl: webhookBridge.provisionUrl,
            sharedSecret: webhookBridge.sharedSecret,
            isEnabled: webhookBridge.isEnabled,
        };
    }

    @POST
    @Path(":bridgeId")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async updateBridge(@PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;

        const bridge = await WebhookBridgeRecord.findByPk(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        bridge.sharedSecret = request.sharedSecret;
        await bridge.save();

        LogService.info("AdminWebhooksService", userId + " updated Webhook Bridge " + bridge.id);

        Cache.for(CACHE_WEBHOOKS_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/upstream")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async newConfigForUpstream(@QueryParam("scalar_token") _scalarToken: string, _request: CreateWithUpstream): Promise<BridgeResponse> {
        throw new ApiError(400, "Cannot create a webhook bridge from an upstream");
    }

    @POST
    @Path("new/selfhosted")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async newSelfhosted(request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;

        const bridge = await WebhookBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            sharedSecret: request.sharedSecret,
            isEnabled: true,
        });
        LogService.info("AdminWebhooksService", userId + " created a new Webhook Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_WEBHOOKS_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }
}