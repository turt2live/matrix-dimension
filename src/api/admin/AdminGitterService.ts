import { Context, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_GITTER_BRIDGE, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import GitterBridgeRecord from "../../db/models/GitterBridgeRecord";
import Upstream from "../../db/models/Upstream";
import { ROLE_MSC_ADMIN, ROLE_MSC_USER } from "../security/MSCSecurity";

interface CreateWithUpstream {
    upstreamId: number;
}

interface CreateSelfhosted {
    provisionUrl: string;
}

interface BridgeResponse {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    isEnabled: boolean;
}

/**
 * Administrative API for configuring Gitter bridge instances.
 */
@Path("/api/v1/dimension/admin/gitter")
export class AdminGitterService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getBridges(): Promise<BridgeResponse[]> {
        const bridges = await GitterBridgeRecord.findAll();
        return Promise.all(bridges.map(async b => {
            return {
                id: b.id,
                upstreamId: b.upstreamId,
                provisionUrl: b.provisionUrl,
                isEnabled: b.isEnabled,
            };
        }));
    }

    @GET
    @Path(":bridgeId")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getBridge(@PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        const telegramBridge = await GitterBridgeRecord.findByPk(bridgeId);
        if (!telegramBridge) throw new ApiError(404, "Gitter Bridge not found");

        return {
            id: telegramBridge.id,
            upstreamId: telegramBridge.upstreamId,
            provisionUrl: telegramBridge.provisionUrl,
            isEnabled: telegramBridge.isEnabled,
        };
    }

    @POST
    @Path(":bridgeId")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async updateBridge(@PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;
        const bridge = await GitterBridgeRecord.findByPk(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        await bridge.save();

        LogService.info("AdminGitterService", userId + " updated Gitter Bridge " + bridge.id);

        Cache.for(CACHE_GITTER_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/upstream")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async newConfigForUpstream(request: CreateWithUpstream): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;
        const upstream = await Upstream.findByPk(request.upstreamId);
        if (!upstream) throw new ApiError(400, "Upstream not found");

        const bridge = await GitterBridgeRecord.create({
            upstreamId: request.upstreamId,
            isEnabled: true,
        });
        LogService.info("AdminGitterService", userId + " created a new Gitter Bridge from upstream " + request.upstreamId);

        Cache.for(CACHE_GITTER_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/selfhosted")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async newSelfhosted(request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;
        const bridge = await GitterBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            isEnabled: true,
        });
        LogService.info("AdminGitterService", userId + " created a new Gitter Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_GITTER_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }
}