import { Context, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { DimensionIntegrationsService } from "../dimension/DimensionIntegrationsService";
import { WidgetStore } from "../../db/WidgetStore";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { Integration } from "../../integrations/Integration";
import { LogService } from "matrix-js-snippets";
import { BridgeStore } from "../../db/BridgeStore";
import { ROLE_MSC_ADMIN, ROLE_MSC_USER } from "../security/MSCSecurity";

interface SetEnabledRequest {
    enabled: boolean;
}

interface SetOptionsRequest {
    options: any;
}

/**
 * Administrative API for managing the integrations for Dimension. This is to enable/disable integrations
 * and set basic options. See the NEB APIs for configuring go-neb instances.
 */
@Path("/api/v1/dimension/admin/integrations")
export class AdminIntegrationsService {

    @Context
    private context: ServiceContext;

    @POST
    @Path(":category/:type/options")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async setOptions(@PathParam("category") category: string, @PathParam("type") type: string, body: SetOptionsRequest): Promise<any> {
        const userId = this.context.request.user.userId;

        if (category === "widget") await WidgetStore.setOptions(type, body.options);
        else throw new ApiError(400, "Unrecognized category");

        LogService.info("AdminIntegrationsService", userId + " updated the integration options for " + category + "/" + type);
        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }


    @POST
    @Path(":category/:type/enabled")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async setEnabled(@PathParam("category") category: string, @PathParam("type") type: string, body: SetEnabledRequest): Promise<any> {
        const userId = this.context.request.user.userId;

        if (category === "widget") await WidgetStore.setEnabled(type, body.enabled);
        else if (category === "bridge") await BridgeStore.setEnabled(type, body.enabled);
        else throw new ApiError(400, "Unrecognized category");

        LogService.info("AdminIntegrationsService", userId + " set " + category + "/" + type + " to " + (body.enabled ? "enabled" : "disabled"));
        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @GET
    @Path(":category/all")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getAllIntegrations(@PathParam("category") category: string): Promise<Integration[]> {
        const userId = this.context.request.user.userId;

        if (category === "widget") return await DimensionIntegrationsService.getWidgets(false);
        else if (category === "bridge") return await DimensionIntegrationsService.getBridges(false, userId);
        else throw new ApiError(400, "Unrecongized category");
    }
}