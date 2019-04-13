import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { Cache, CACHE_INTEGRATIONS, CACHE_IRC_BRIDGE } from "../../MemoryCache";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import IrcBridgeRecord from "../../db/models/IrcBridgeRecord";
import { AvailableNetworks, IrcBridge } from "../../bridges/IrcBridge";
import Upstream from "../../db/models/Upstream";
import IrcBridgeNetwork from "../../db/models/IrcBridgeNetwork";

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
    availableNetworks: AvailableNetworks;
    isOnline: boolean;
}

interface SetEnabledRequest {
    isEnabled: boolean;
}

/**
 * Administrative API for configuring IRC bridge instances.
 */
@Path("/api/v1/dimension/admin/irc")
export class AdminIrcService {

    @GET
    @Path("all")
    public async getBridges(@QueryParam("scalar_token") scalarToken: string): Promise<BridgeResponse[]> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridges = await IrcBridgeRecord.findAll();
        const client = new IrcBridge(userId);
        return Promise.all(bridges.map(async b => {
            let networks = null;
            let isOnline = true;
            try {
                networks = await client.getNetworks(b);
            } catch (e) {
                LogService.error("AdminIrcService", e);
                isOnline = false;
            }
            return {
                id: b.id,
                upstreamId: b.upstreamId,
                provisionUrl: b.provisionUrl,
                isEnabled: b.isEnabled,
                availableNetworks: networks,
                isOnline: isOnline,
            };
        }));
    }

    @GET
    @Path(":bridgeId")
    public async getBridge(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const ircBridge = await IrcBridgeRecord.findByPrimary(bridgeId);
        if (!ircBridge) throw new ApiError(404, "IRC Bridge not found");

        const client = new IrcBridge(userId);
        let networks = null;
        let isOnline = true;
        try {
            networks = await client.getNetworks(ircBridge);
        } catch (e) {
            LogService.error("AdminIrcService", e);
            isOnline = false;
        }
        return {
            id: ircBridge.id,
            upstreamId: ircBridge.upstreamId,
            provisionUrl: ircBridge.provisionUrl,
            isEnabled: ircBridge.isEnabled,
            availableNetworks: networks,
            isOnline: isOnline,
        };
    }

    @POST
    @Path(":bridgeId/network/:networkId/enabled")
    public async setNetworkEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("bridgeId") bridgeId: number, @PathParam("networkId") networkId: string, request: SetEnabledRequest): Promise<any> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const ircBridge = await IrcBridgeRecord.findByPrimary(bridgeId);
        if (!ircBridge) throw new ApiError(404, "IRC Bridge not found");

        const localNetworkId = IrcBridge.parseNetworkId(networkId).bridgeNetworkId;
        const network = await IrcBridgeNetwork.findOne({
            where: {
                bridgeId: ircBridge.id,
                bridgeNetworkId: localNetworkId,
            },
        });
        if (!network) throw new ApiError(404, "Network not found");

        network.isEnabled = request.isEnabled;
        await network.save();

        LogService.info("AdminIrcService", userId + " toggled the network '" + localNetworkId + "' on bridge " + ircBridge.id);
        Cache.for(CACHE_IRC_BRIDGE).clear();
        return {}; // 200 OK
    }

    @POST
    @Path("new/upstream")
    public async newConfigForUpstream(@QueryParam("scalar_token") scalarToken: string, request: CreateWithUpstream): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const upstream = await Upstream.findByPrimary(request.upstreamId);
        if (!upstream) throw new ApiError(400, "Upstream not found");

        const bridge = await IrcBridgeRecord.create({
            upstreamId: request.upstreamId,
            isEnabled: true,
        });
        LogService.info("AdminIrcService", userId + " created a new IRC Bridge from upstream " + request.upstreamId);

        Cache.for(CACHE_IRC_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }

    @POST
    @Path("new/selfhosted")
    public async newSelfhosted(@QueryParam("scalar_token") scalarToken: string, request: CreateSelfhosted): Promise<BridgeResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bridge = await IrcBridgeRecord.create({
            provisionUrl: request.provisionUrl,
            isEnabled: true,
        });
        LogService.info("AdminIrcService", userId + " created a new IRC Bridge with provisioning URL " + request.provisionUrl);

        Cache.for(CACHE_IRC_BRIDGE).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return this.getBridge(scalarToken, bridge.id);
    }
}