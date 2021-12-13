import { Context, GET, Path, PathParam, POST, QueryParam, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_HOOKSHOT_WEBHOOK_BRIDGE, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { LogService } from "matrix-bot-sdk";
import { ApiError } from "../ApiError";
import { ROLE_ADMIN, ROLE_USER } from "../security/MatrixSecurity";
import HookshotWebhookBridgeRecord from "../../db/models/HookshotWebhookBridgeRecord";

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
 * Administrative API for configuring Hookshot Webhook bridge instances.
 */
@Path("/api/v1/dimension/admin/hookshot/webhook")
export class AdminHookshotWebhookService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBridges(): Promise<BridgeResponse[]> {
        const bridges = await HookshotWebhookBridgeRecord.findAll();
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
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBridge(@PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        const bridge = await HookshotWebhookBridgeRecord.findByPk(bridgeId);
        if (!bridge) throw new ApiError(404, "Webhook Bridge not found");

        return {
            id: bridge.id,
            upstreamId: bridge.upstreamId,
            provisionUrl: bridge.provisionUrl,
            sharedSecret: bridge.sharedSecret,
            isEnabled: bridge.isEnabled,
        };
    }

    @POST
    @Path(":bridgeId")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async updateBridge(@PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;

        const bridge = await HookshotWebhookBridgeRecord.findByPk(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        bridge.sharedSecret = request.sharedSecret;
        await bridge.save();

        LogService.info("AdminHookshotWebhookService", userId + " updated Hookshot Webhook Bridge " + bridge.id);

        Cache.for(CACHE_HOOKSHOT_WEBHOOK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/upstream")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async newConfigForUpstream(@QueryParam("scalar_token") _scalarToken: string, _request: CreateWithUpstream): Promise<BridgeResponse> {
        throw new ApiError(400, "Cannot create a webhook bridge from an upstream");
    }

    @POST
    @Path("new/selfhosted")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async newSelfhosted(request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;

        const bridge = await HookshotWebhookBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            sharedSecret: request.sharedSecret,
            isEnabled: true,
        });
        LogService.info("AdminHookshotWebhookService", userId + " created a new Hookshot Webhook Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_HOOKSHOT_WEBHOOK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }
}
