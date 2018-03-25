import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { ApiError } from "../ApiError";
import { AdminService } from "./AdminService";
import { DimensionIntegrationsService } from "../dimension/DimensionIntegrationsService";
import { WidgetStore } from "../../db/WidgetStore";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { Integration } from "../../integrations/Integration";

interface SetEnabledRequest {
    enabled: boolean;
}

interface SetOptionsRequest {
    options: any;
}

@Path("/api/v1/dimension/admin/integrations")
export class AdminIntegrationsService {

    @POST
    @Path(":category/:type/options")
    public async setOptions(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetOptionsRequest): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        if (category === "widget") await WidgetStore.setOptions(type, body.options);
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }


    @POST
    @Path(":category/:type/enabled")
    public async setEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetEnabledRequest): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        if (category === "widget") await WidgetStore.setEnabled(type, body.enabled);
        else throw new ApiError(400, "Unrecognized category");

        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @GET
    @Path(":category/all")
    public async getAllIntegrations(@QueryParam("scalar_token") scalarToken: string, @QueryParam("category") category: string): Promise<Integration[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        if (category === "widget") return await DimensionIntegrationsService.getWidgets(false);
        else throw new ApiError(400, "Unrecongized category");
    }
}