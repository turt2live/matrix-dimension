import { Context, GET, Path, PathParam, POST, QueryParam, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_HOOKSHOT_GITHUB_BRIDGE, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { LogService } from "matrix-bot-sdk";
import { ApiError } from "../ApiError";
import { ROLE_ADMIN, ROLE_USER } from "../security/MatrixSecurity";
import HookshotGithubBridgeRecord from "../../db/models/HookshotGithubBridgeRecord";

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
 * Administrative API for configuring Hookshot Github bridge instances.
 */
@Path("/api/v1/dimension/admin/hookshot/github")
export class AdminHookshotGithubService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBridges(): Promise<BridgeResponse[]> {
        const bridges = await HookshotGithubBridgeRecord.findAll();
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
        const githubBridge = await HookshotGithubBridgeRecord.findByPk(bridgeId);
        if (!githubBridge) throw new ApiError(404, "Github Bridge not found");

        return {
            id: githubBridge.id,
            upstreamId: githubBridge.upstreamId,
            provisionUrl: githubBridge.provisionUrl,
            sharedSecret: githubBridge.sharedSecret,
            isEnabled: githubBridge.isEnabled,
        };
    }

    @POST
    @Path(":bridgeId")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async updateBridge(@PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;

        const bridge = await HookshotGithubBridgeRecord.findByPk(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        bridge.sharedSecret = request.sharedSecret;
        await bridge.save();

        LogService.info("AdminHookshotGithubService", userId + " updated Hookshot Github Bridge " + bridge.id);

        Cache.for(CACHE_HOOKSHOT_GITHUB_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }

    @POST
    @Path("new/upstream")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async newConfigForUpstream(@QueryParam("scalar_token") _scalarToken: string, _request: CreateWithUpstream): Promise<BridgeResponse> {
        throw new ApiError(400, "Cannot create a github bridge from an upstream");
    }

    @POST
    @Path("new/selfhosted")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async newSelfhosted(request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = this.context.request.user.userId;

        const bridge = await HookshotGithubBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            sharedSecret: request.sharedSecret,
            isEnabled: true,
        });
        LogService.info("AdminHookshotGithubService", userId + " created a new Hookshot Github Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_HOOKSHOT_GITHUB_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(bridge.id);
    }
}
