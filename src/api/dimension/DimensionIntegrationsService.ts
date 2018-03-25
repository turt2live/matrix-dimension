import { DELETE, GET, Path, PathParam, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import { Widget } from "../../integrations/Widget";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { Integration } from "../../integrations/Integration";
import { ApiError } from "../ApiError";
import { WidgetStore } from "../../db/WidgetStore";
import { SimpleBot } from "../../integrations/SimpleBot";
import { NebStore } from "../../db/NebStore";

export interface IntegrationsResponse {
    widgets: Widget[],
    bots: SimpleBot[],
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

    @GET
    @Path("enabled")
    public async getEnabledIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        const userId = await ScalarService.getTokenOwner(scalarToken);
        return {
            widgets: await DimensionIntegrationsService.getWidgets(true),
            bots: await DimensionIntegrationsService.getSimpleBots(userId),
        };
    }

    @GET
    @Path("room/:roomId")
    public async getIntegrationsInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<IntegrationsResponse> {
        console.log(roomId);
        // TODO: Other integrations
        return this.getEnabledIntegrations(scalarToken);
    }

    @DELETE
    @Path("room/:roomId/integrations/:category/:type")
    public async removeIntegrationInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string, @PathParam("category") category: string, @PathParam("type") integrationType: string): Promise<any> {
        const userId = await ScalarService.getTokenOwner(scalarToken);

        if (category === "widget") throw new ApiError(400, "Widgets should be removed client-side");
        else if (category === "bot") await NebStore.removeSimpleBot(integrationType, roomId, userId);
        else throw new ApiError(400, "Unrecognized category");

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