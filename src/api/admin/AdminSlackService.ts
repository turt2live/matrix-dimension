import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { Cache, CACHE_INTEGRATIONS, CACHE_SLACK_BRIDGE } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import Upstream from "../../db/models/Upstream";
import SlackBridgeRecord from "../../db/models/SlackBridgeRecord";

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
 * Administrative API for configuring Slack bridge instances.
 */
@Path("/api/v1/dimension/admin/slack")
export class AdminSlackService {

    @GET
    @Path("all")
    public async getBridges(@QueryParam("scalar_token") scalarToken: string): Promise<BridgeResponse[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridges = await SlackBridgeRecord.findAll();
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

        const telegramBridge = await SlackBridgeRecord.findByPrimary(bridgeId);
        if (!telegramBridge) throw new ApiError(404, "Slack Bridge not found");

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

        const bridge = await SlackBridgeRecord.findByPrimary(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        await bridge.save();

        LogService.info("AdminSlackService", userId + " updated Slack Bridge " + bridge.id);

        Cache.for(CACHE_SLACK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/upstream")
    public async newConfigForUpstream(@QueryParam("scalar_token") scalarToken: string, request: CreateWithUpstream): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const upstream = await Upstream.findByPrimary(request.upstreamId);
        if (!upstream) throw new ApiError(400, "Upstream not found");

        const bridge = await SlackBridgeRecord.create({
            upstreamId: request.upstreamId,
            isEnabled: true,
        });
        LogService.info("AdminSlackService", userId + " created a new Slack Bridge from upstream " + request.upstreamId);

        Cache.for(CACHE_SLACK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/selfhosted")
    public async newSelfhosted(@QueryParam("scalar_token") scalarToken: string, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await SlackBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            isEnabled: true,
        });
        LogService.info("AdminSlackService", userId + " created a new Slack Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_SLACK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }
}