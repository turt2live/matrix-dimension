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

export interface IntegrationsResponse {
    widgets: Widget[],
    bots: SimpleBot[],
    complexBots: ComplexBot[],
}

@Path("/api/v1/dimension/integrations")
export class DimensionIntegrationsService {

    public static async getWidgets(enabledOnly: boolean): Promise<Widget[]> {
        const cached = Cache.for(CACHE_INTEGRATIONS).get("widgets");
        if (cached) return cached;

        const widgets = await WidgetStore.listAll(enabledOnly ? true : null);
        Cache.for(CACHE_INTEGRATIONS).put("widgets", widgets);
        return widgets;
    }

    public static async getSimpleBots(userId: string): Promise<SimpleBot[]> {
        const cached = Cache.for(CACHE_INTEGRATIONS).get("simple_bots");
        if (cached) return cached;

        const bots = await NebStore.listSimpleBots(userId);
        Cache.for(CACHE_INTEGRATIONS).put("simple_bots", bots);
        return bots;
    }

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
        };
    }

    @GET
    @Path("room/:roomId/integrations/:category/:type")
    public async getIntegrationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string): Promise<any> {
        const roomConfig = await this.getIntegrationsInRoom(scalarToken, roomId); // does auth for us

        if (category === "widget") return roomConfig.widgets.find(i => i.type === integrationType);
        else if (category === "bot") return roomConfig.bots.find(i => i.type === integrationType);
        else if (category === "complex-bot") return roomConfig.complexBots.find(i => i.type === integrationType);
        else throw new ApiError(400, "Unrecognized category");
    }

    @POST
    @Path("room/:roomId/integrations/:category/:type/config")
    public async setIntegrationConfigurationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string, newConfig: any): Promise<any> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        if (category === "complex-bot") await NebStore.setComplexBotConfig(userId, integrationType, roomId, newConfig);
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear(); // TODO: Improve which cache we invalidate
        return {}; // 200 OK
    }

    @DELETE
    @Path("room/:roomId/integrations/:category/:type")
    public async removeIntegrationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string): Promise<any> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        if (category === "widget") throw new ApiError(400, "Widgets should be removed client-side");
        else if (category === "bot") await NebStore.removeSimpleBot(integrationType, roomId, userId);
        else if (category === "complex-bot") throw new ApiError(400, "Complex bots should be removed automatically");
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