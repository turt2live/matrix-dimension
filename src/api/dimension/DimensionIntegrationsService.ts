import { DELETE, GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import { Widget } from "../../integrations/Widget";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { Integration } from "../../integrations/Integration";
import { ApiError } from "../ApiError";
import { WidgetStore } from "../../db/WidgetStore";
import { SimpleBot } from "../../integrations/SimpleBot";
import { NebStore } from "../../db/NebStore";
import { ComplexBot } from "../../integrations/ComplexBot";
import { Bridge } from "../../integrations/Bridge";
import { BridgeStore } from "../../db/BridgeStore";
import { BotStore } from "../../db/BotStore";

export interface IntegrationsResponse {
    widgets: Widget[],
    bots: SimpleBot[],
    complexBots: ComplexBot[],
    bridges: Bridge[],
}

/**
 * API for managing integrations, primarily for a given room
 */
@Path("/api/v1/dimension/integrations")
export class DimensionIntegrationsService {

    /**
     * Gets a list of widgets
     * @param {boolean} enabledOnly True to only return the enabled widgets
     * @returns {Promise<Widget[]>} Resolves to the widget list
     */
    public static async getWidgets(enabledOnly: boolean): Promise<Widget[]> {
        const cached = Cache.for(CACHE_INTEGRATIONS).get("widgets");
        if (cached) return cached;

        const widgets = await WidgetStore.listAll(enabledOnly ? true : null);
        Cache.for(CACHE_INTEGRATIONS).put("widgets", widgets);
        return widgets;
    }

    /**
     * Gets a list of bridges
     * @param {boolean} enabledOnly True to only return the enabled bridges
     * @param {string} forUserId The requesting user ID
     * @param {string} inRoomId If specified, the room ID to list the bridges in
     * @returns {Promise<Bridge[]>} Resolves to the bridge list
     */
    public static async getBridges(enabledOnly: boolean, forUserId: string, inRoomId?: string): Promise<Bridge[]> {
        return BridgeStore.listAll(forUserId, enabledOnly ? true : null, inRoomId);
    }

    /**
     * Gets a list of simple bots
     * @param {string} userId The requesting user ID
     * @returns {Promise<SimpleBot[]>} Resolves to the simple bot list
     */
    public static async getSimpleBots(userId: string): Promise<SimpleBot[]> {
        const cached = Cache.for(CACHE_INTEGRATIONS).get("simple_bots");
        if (cached) return cached;

        const nebs = await NebStore.listSimpleBots(userId);
        const custom = (await BotStore.getCustomBots())
            .filter(b => b.isEnabled)
            .map(b => SimpleBot.fromCached(b));
        const bots = [...nebs, ...custom];
        Cache.for(CACHE_INTEGRATIONS).put("simple_bots", bots);
        return bots;
    }

    /**
     * Gets a list of complex bots
     * @param {string} userId The requesting user ID
     * @param {string} roomId The room ID to get the complex bots for
     * @returns {Promise<ComplexBot[]>} Resolves to the complex bot list
     */
    public static async getComplexBots(userId: string, roomId: string): Promise<ComplexBot[]> {
        const cached = Cache.for(CACHE_INTEGRATIONS).get("complex_bots_" + roomId);
        if (cached) return cached;

        const bots = await NebStore.listComplexBots(userId, roomId);
        Cache.for(CACHE_INTEGRATIONS).put("complex_bots_" + roomId, bots);
        return bots;
    }

    @GET
    @Path("room/:roomId")
    public async getIntegrationsInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<IntegrationsResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);
        return {
            widgets: await DimensionIntegrationsService.getWidgets(true),
            bots: await DimensionIntegrationsService.getSimpleBots(userId),
            complexBots: await DimensionIntegrationsService.getComplexBots(userId, roomId),
            bridges: await DimensionIntegrationsService.getBridges(true, userId, roomId),
        };
    }

    @GET
    @Path("room/:roomId/integrations/:category/:type")
    public async getIntegrationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string): Promise<any> {
        const roomConfig = await this.getIntegrationsInRoom(scalarToken, roomId); // does auth for us

        if (category === "widget") return roomConfig.widgets.find(i => i.type === integrationType);
        else if (category === "bot") return roomConfig.bots.find(i => i.type === integrationType);
        else if (category === "complex-bot") return roomConfig.complexBots.find(i => i.type === integrationType);
        else if (category === "bridge") return roomConfig.bridges.find(i => i.type === integrationType);
        else throw new ApiError(400, "Unrecognized category");
    }

    @POST
    @Path("room/:roomId/integrations/:category/:type/config")
    public async setIntegrationConfigurationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string, newConfig: any): Promise<any> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        if (category === "complex-bot") await NebStore.setComplexBotConfig(userId, integrationType, roomId, newConfig);
        else if (category === "bridge") await BridgeStore.setBridgeRoomConfig(userId, integrationType, roomId, newConfig);
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear(); // TODO: Improve which cache we invalidate
        return {}; // 200 OK
    }

    @DELETE
    @Path("room/:roomId/integrations/:category/:type")
    public async removeIntegrationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string): Promise<any> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        if (category === "widget") throw new ApiError(400, "Widgets should be removed client-side");
        else if (category === "bot") {
            if (integrationType.startsWith(BotStore.TYPE_PREFIX)) {
                await BotStore.removeCustomByTypeFromRoom(integrationType, roomId);
            } else await NebStore.removeSimpleBot(integrationType, roomId, userId);
        } else if (category === "complex-bot") throw new ApiError(400, "Complex bots should be removed automatically");
        else if (category === "bridge") throw new ApiError(400, "Bridges should be removed automatically");
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear(); // TODO: Improve which cache we invalidate
        return {}; // 200 OK
    }

    @GET
    @Path(":category/:type")
    public async getIntegration(@PathParam("category") category: string, @PathParam("type") type: string): Promise<Integration> {
        // This is intentionally an unauthed endpoint to ensure we can use it in widgets

        let integrations: Integration[] = [];
        if (category === "widget") integrations = await DimensionIntegrationsService.getWidgets(true);
        else throw new ApiError(400, "Unsupported category");

        for (const integration of integrations) {
            if (integration.category === category && integration.type === type) {
                return integration;
            }
        }

        throw new ApiError(404, "Integration not found");
    }
}