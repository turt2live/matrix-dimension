import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { ScalarService } from "../scalar/ScalarService";
import { DimensionStore } from "../../db/DimensionStore";
import { DimensionAdminService } from "./DimensionAdminService";
import { Widget } from "../../integrations/Widget";
import { MemoryCache } from "../../MemoryCache";
import { Integration } from "../../integrations/Integration";
import { ApiError } from "../ApiError";

interface IntegrationsResponse {
    widgets: Widget[],
}

interface SetEnabledRequest {
    enabled: boolean;
}

interface SetOptionsRequest {
    options: any;
}

@Path("/api/v1/dimension/integrations")
export class DimensionIntegrationsService {

    private static integrationCache = new MemoryCache();

    public static clearIntegrationCache() {
        DimensionIntegrationsService.integrationCache.clear();
    }

    @POST
    @Path(":category/:type/enabled")
    public setEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetEnabledRequest): Promise<any> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            if (category === "widget") {
                return DimensionStore.setWidgetEnabled(type, body.enabled);
            } else throw new ApiError(400, "Unrecongized category");
        }).then(() => DimensionIntegrationsService.clearIntegrationCache());
    }

    @POST
    @Path(":category/:type/options")
    public setOptions(@QueryParam("scalar_token") scalarToken: string, @PathParam("category") category: string, @PathParam("type") type: string, body: SetOptionsRequest): Promise<any> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            if (category === "widget") {
                return DimensionStore.setWidgetOptions(type, body.options);
            } else throw new ApiError(400, "Unrecongized category");
        }).then(() => DimensionIntegrationsService.clearIntegrationCache());
    }

    @GET
    @Path("enabled")
    public getEnabledIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        return ScalarService.getTokenOwner(scalarToken).then(_userId => {
            return this.getIntegrations(true);
        }, ScalarService.invalidTokenErrorHandler);
    }

    @GET
    @Path("all")
    public getAllIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return this.getIntegrations(null);
        });
    }

    @GET
    @Path("room/:roomId")
    public getIntegrationsInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string): Promise<IntegrationsResponse> {
        console.log(roomId);
        return this.getEnabledIntegrations(scalarToken);
    }

    @GET
    @Path(":category/:type")
    public getIntegration(@PathParam("category") category: string, @PathParam("type") type: string): Promise<Integration> {
        return this.getIntegrations(true).then(response => {
            for (const key of Object.keys(response)) {
                for (const integration of <Integration[]>response[key]) {
                    if (integration.category === category && integration.type === type) {
                        return integration;
                    }
                }
            }

            throw new ApiError(404, "Integration not found");
        });
    }

    private getIntegrations(isEnabledCheck?: boolean): Promise<IntegrationsResponse> {
        const cachedResponse = DimensionIntegrationsService.integrationCache.get("integrations_" + isEnabledCheck);
        if (cachedResponse) {
            return cachedResponse;
        }
        const response = <IntegrationsResponse>{
            widgets: [],
        };
        return Promise.resolve()
            .then(() => DimensionStore.getWidgets(isEnabledCheck))
            .then(widgets => response.widgets = widgets)

            // Cache and return response
            .then(() => DimensionIntegrationsService.integrationCache.put("integrations_" + isEnabledCheck, response))
            .then(() => response);
    }
}