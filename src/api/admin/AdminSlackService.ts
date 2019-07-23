import { Context, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_INTEGRATIONS, CACHE_SLACK_BRIDGE } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import Upstream from "../../db/models/Upstream";
import SlackBridgeRecord from "../../db/models/SlackBridgeRecord";
import { ROLE_ADMIN, ROLE_USER } from "../security/MatrixSecurity";

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

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBridges(): Promise<BridgeResponse[]> {
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
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBridge(@PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        const telegramBridge = await SlackBridgeRecord.findByPk(bridgeId);
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
    @Security([ROLE_USER, ROLE_ADMIN])
    public async updateBridge(@PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;
        const bridge = await SlackBridgeRecord.findByPk(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        await bridge.save();

        LogService.info("AdminSlackService", userId + " updated Slack Bridge " + bridge.id);

        Cache.for(CACHE_SLACK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/upstream")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async newConfigForUpstream(request: CreateWithUpstream): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;
        const upstream = await Upstream.findByPk(request.upstreamId);
        if (!upstream) throw new ApiError(400, "Upstream not found");

        const bridge = await SlackBridgeRecord.create({
            upstreamId: request.upstreamId,
            isEnabled: true,
        });
        LogService.info("AdminSlackService", userId + " created a new Slack Bridge from upstream " + request.upstreamId);

        Cache.for(CACHE_SLACK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/selfhosted")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async newSelfhosted(request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;
        const bridge = await SlackBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            isEnabled: true,
        });
        LogService.info("AdminSlackService", userId + " created a new Slack Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_SLACK_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }
}