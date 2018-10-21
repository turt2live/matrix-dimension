import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { Cache, CACHE_GITTER_BRIDGE, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import GitterBridgeRecord from "../../db/models/GitterBridgeRecord";
import Upstream from "../../db/models/Upstream";

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

    @GET
    @Path("all")
    public async getBridges(@QueryParam("scalar_token") scalarToken: string): Promise<BridgeResponse[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

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
    public async getBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const telegramBridge = await GitterBridgeRecord.findByPrimary(bridgeId);
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
    public async updateBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await GitterBridgeRecord.findByPrimary(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        await bridge.save();

        LogService.info("AdminGitterService", userId + " updated Gitter Bridge " + bridge.id);

        Cache.for(CACHE_GITTER_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/upstream")
    public async newConfigForUpstream(@QueryParam("scalar_token") scalarToken: string, request: CreateWithUpstream): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const upstream = await Upstream.findByPrimary(request.upstreamId);
        if (!upstream) throw new ApiError(400, "Upstream not found");

        const bridge = await GitterBridgeRecord.create({
            upstreamId: request.upstreamId,
            isEnabled: true,
        });
        LogService.info("AdminGitterService", userId + " created a new Gitter Bridge from upstream " + request.upstreamId);

        Cache.for(CACHE_GITTER_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/selfhosted")
    public async newSelfhosted(@QueryParam("scalar_token") scalarToken: string, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await GitterBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            isEnabled: true,
        });
        LogService.info("AdminGitterService", userId + " created a new Gitter Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_GITTER_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }
}