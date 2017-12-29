import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { ApiError } from "../ApiError";
import { DimensionAdminService } from "./DimensionAdminService";
import { DimensionIntegrationsService, IntegrationsResponse } from "./DimensionIntegrationsService";
import { WidgetStore } from "../../db/WidgetStore";
import { CACHE_INTEGRATIONS, Cache } from "../../MemoryCache";

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
    public setOptions(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetOptionsRequest): Promise<any> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            if (category === "widget") {
                return WidgetStore.setOptions(type, body.options);
            } else throw new ApiError(400, "Unrecongized category");
        }).then(() => Cache.for(CACHE_INTEGRATIONS).clear());
    }

    @POST
    @Path(":category/:type/enabled")
    public setEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetEnabledRequest): Promise<any> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            if (category === "widget") {
                return WidgetStore.setEnabled(type, body.enabled);
            } else throw new ApiError(400, "Unrecongized category");
        }).then(() => Cache.for(CACHE_INTEGRATIONS).clear());
    }

    @GET
    @Path("all")
    public getAllIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return DimensionIntegrationsService.getIntegrations(null);
        });
    }
}