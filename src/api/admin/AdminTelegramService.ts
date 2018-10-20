import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { Cache, CACHE_INTEGRATIONS, CACHE_TELEGRAM_BRIDGE } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import TelegramBridgeRecord from "../../db/models/TelegramBridgeRecord";

interface CreateWithUpstream {
    upstreamId: number;
}

interface CreateSelfhosted {
    provisionUrl: string;
    sharedSecret: string;
    allowTgPuppets: boolean;
    allowMxPuppets: boolean;
}

interface BridgeResponse {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    allowTgPuppets?: boolean;
    allowMxPuppets?: boolean;
    sharedSecret?: string;
    isEnabled: boolean;
}

/**
 * Administrative API for configuring Telegram bridge instances.
 */
@Path("/api/v1/dimension/admin/telegram")
export class AdminTelegramService {

    @GET
    @Path("all")
    public async getBridges(@QueryParam("scalar_token") scalarToken: string): Promise<BridgeResponse[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridges = await TelegramBridgeRecord.findAll();
        return Promise.all(bridges.map(async b => {
            return {
                id: b.id,
                upstreamId: b.upstreamId,
                provisionUrl: b.provisionUrl,
                allowTgPuppets: b.allowTgPuppets,
                allowMxPuppets: b.allowMxPuppets,
                sharedSecret: b.sharedSecret,
                isEnabled: b.isEnabled,
            };
        }));
    }

    @GET
    @Path(":bridgeId")
    public async getBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const telegramBridge = await TelegramBridgeRecord.findByPrimary(bridgeId);
        if (!telegramBridge) throw new ApiError(404, "Telegram Bridge not found");

        return {
            id: telegramBridge.id,
            upstreamId: telegramBridge.upstreamId,
            provisionUrl: telegramBridge.provisionUrl,
            allowTgPuppets: telegramBridge.allowTgPuppets,
            allowMxPuppets: telegramBridge.allowMxPuppets,
            sharedSecret: telegramBridge.sharedSecret,
            isEnabled: telegramBridge.isEnabled,
        };
    }

    @POST
    @Path(":bridgeId")
    public async updateBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await TelegramBridgeRecord.findByPrimary(bridgeId);
        if (!bridge) throw new ApiError(404, "Bridge not found");

        bridge.provisionUrl = request.provisionUrl;
        bridge.sharedSecret = request.sharedSecret;
        bridge.allowTgPuppets = request.allowTgPuppets;
        bridge.allowMxPuppets = request.allowMxPuppets;
        await bridge.save();

        LogService.info("AdminTelegramService", userId + " updated Telegram Bridge " + bridge.id);

        Cache.for(CACHE_TELEGRAM_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/upstream")
    public async newConfigForUpstream(@QueryParam("scalar_token") _scalarToken: string, _request: CreateWithUpstream): Promise<BridgeResponse> {
        throw new ApiError(400, "Cannot create a telegram bridge from an upstream");
    }

    @POST
    @Path("new/selfhosted")
    public async newSelfhosted(@QueryParam("scalar_token") scalarToken: string, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await TelegramBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            sharedSecret: request.sharedSecret,
            allowTgPuppets: request.allowTgPuppets,
            allowMxPuppets: request.allowMxPuppets,
            isEnabled: true,
        });
        LogService.info("AdminTelegramService", userId + " created a new Telegram Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_TELEGRAM_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }
}