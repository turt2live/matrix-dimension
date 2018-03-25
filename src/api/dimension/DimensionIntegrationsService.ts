import { GET, Path, PathParam, QueryParam } from "typescript-rest";
import { ScalarService } from "../scalar/ScalarService";
import { Widget } from "../../integrations/Widget";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { Integration } from "../../integrations/Integration";
import { ApiError } from "../ApiError";
import { WidgetStore } from "../../db/WidgetStore";
import { NebStore } from "../../db/NebStore";

export interface IntegrationsResponse {
    widgets: Widget[],
}

@Path("/api/v1/dimension/integrations")
export class DimensionIntegrationsService {

    public static async getIntegrations(isEnabledCheck?: boolean): Promise<IntegrationsResponse> {
        const cachedIntegrations = Cache.for(CACHE_INTEGRATIONS).get("integrations_" + isEnabledCheck);
        if (cachedIntegrations) {
            return cachedIntegrations;
        }

        const integrations = {
            widgets: await WidgetStore.listAll(isEnabledCheck),
            bots: await NebStore.listSimpleBots(), // No enabled check - managed internally
        };

        Cache.for(CACHE_INTEGRATIONS).put("integrations_" + isEnabledCheck, integrations);
        return integrations;
    }

    @GET
    @Path("enabled")
    public async getEnabledIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        await ScalarService.getTokenOwner(scalarToken);
        return DimensionIntegrationsService.getIntegrations(true);
    }

    @GET
    @Path("room/:roomId")
    public async getIntegrationsInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<IntegrationsResponse> {
        console.log(roomId);
        // TODO: Other integrations
        return this.getEnabledIntegrations(scalarToken);
    }

    @GET
    @Path(":category/:type")
    public async getIntegration(@PathParam("category") category: string, @PathParam("type") type: string): Promise<Integration> {
        // This is intentionally an unauthed endpoint to ensure we can use it in widgets
        const integrationsResponse = await DimensionIntegrationsService.getIntegrations(true);
        for (const key in integrationsResponse) {
            for (const integration of integrationsResponse[key]) {
                if (integration.category === category && integration.type === type) return integration;
            }
        }

        throw new ApiError(404, "Integration not found");
    }
}