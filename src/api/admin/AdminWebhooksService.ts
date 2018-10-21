import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { Cache, CACHE_INTEGRATIONS, CACHE_WEBHOOKS_BRIDGE } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import WebhookBridgeRecord from "../../db/models/WebhookBridgeRecord";

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

    @GET
    @Path("all")
    public async getBridges(@QueryParam("scalar_token") scalarToken: string): Promise<BridgeResponse[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

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
    public async getBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const webhookBridge = await WebhookBridgeRecord.findByPrimary(bridgeId);
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
    public async updateBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await WebhookBridgeRecord.findByPrimary(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        bridge.sharedSecret = request.sharedSecret;
        await bridge.save();

        LogService.info("AdminWebhooksService", userId + " updated Webhook Bridge " + bridge.id);

        Cache.for(CACHE_WEBHOOKS_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/upstream")
    public async newConfigForUpstream(@QueryParam("scalar_token") _scalarToken: string, _request: CreateWithUpstream): Promise<BridgeResponse> {
        throw new ApiError(400, "Cannot create a webhook bridge from an upstream");
    }

    @POST
    @Path("new/selfhosted")
    public async newSelfhosted(@QueryParam("scalar_token") scalarToken: string, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await WebhookBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            sharedSecret: request.sharedSecret,
            isEnabled: true,
        });
        LogService.info("AdminWebhooksService", userId + " created a new Webhook Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_WEBHOOKS_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }
}