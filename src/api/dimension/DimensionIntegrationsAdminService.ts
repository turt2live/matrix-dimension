import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ApiError } from "../ApiError";
import { DimensionAdminService } from "./DimensionAdminService";
import { DimensionIntegrationsService, IntegrationsResponse } from "./DimensionIntegrationsService";
import { WidgetStore } from "../../db/WidgetStore";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";

interface SetEnabledRequest {
    enabled: boolean;
}

interface SetOptionsRequest {
    options: any;
}

@Path("/api/v1/dimension/admin/integrations")
export class DimensionIntegrationsAdminService {

    @POST
    @Path(":category/:type/options")
    public async setOptions(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetOptionsRequest): Promise<any> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);

        if (category === "widget") await WidgetStore.setOptions(type, body.options);
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }


    @POST
    @Path(":category/:type/enabled")
    public async setEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetEnabledRequest): Promise<any> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);

        if (category === "widget") await WidgetStore.setEnabled(type, body.enabled);
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @GET
    @Path("all")
    public async getAllIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);
        return DimensionIntegrationsService.getIntegrations(null);
    }
}