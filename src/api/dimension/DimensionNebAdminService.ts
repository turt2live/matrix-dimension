import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { DimensionAdminService } from "./DimensionAdminService";
import { Cache, CACHE_NEB } from "../../MemoryCache";
import { NebStore } from "../../db/NebStore";
import { NebConfig } from "../../models/neb";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";

interface CreateWithUpstream {
    upstreamId: number;
}

interface CreateWithAppservice {
    appserviceId: string;
    adminUrl: string;
}

interface SetEnabledRequest {
    enabled: boolean;
}


@Path("/api/v1/dimension/admin/neb")
export class DimensionNebAdminService {

    @GET
    @Path("all")
    public getNebConfigs(@QueryParam("scalar_token") scalarToken: string): Promise<NebConfig[]> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            const cachedConfigs = Cache.for(CACHE_NEB).get("configurations");
            if (cachedConfigs) return cachedConfigs;

            return NebStore.getAllConfigs().then(configs => {
                Cache.for(CACHE_NEB).put("configurations", configs);
                return configs;
            });
        });
    }

    @GET
    @Path(":id/config")
    public getNebConfig(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") nebId: number): Promise<NebConfig> {
        return this.getNebConfigs(scalarToken).then(configs => {
            for (const config of configs) {
                if (config.id === nebId) return config;
            }

            throw new ApiError(404, "Configuration not found");
        });
    }

    @POST
    @Path(":id/integration/:type/enabled")
    public setIntegrationEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") nebId: number, @PathParam("type") integrationType: string, request: SetEnabledRequest): Promise<any> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return NebStore.getOrCreateIntegration(nebId, integrationType);
        }).then(integration => {
            integration.isEnabled = request.enabled;
            return integration.save();
        }).then(() => Cache.for(CACHE_NEB).clear());
    }

    @POST
    @Path("new/upstream")
    public newConfigForUpstream(@QueryParam("scalar_token") scalarToken: string, request: CreateWithUpstream): Promise<NebConfig> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return NebStore.createForUpstream(request.upstreamId).catch(err => {
                LogService.error("DimensionNebAdminService", err);
                throw new ApiError(500, "Error creating go-neb instance");
            });
        }).then(config => {
            Cache.for(CACHE_NEB).clear();
            return config;
        });
    }

    @POST
    @Path("new/appservice")
    public newConfigForAppservice(@QueryParam("scalar_token") scalarToken: string, request: CreateWithAppservice): Promise<NebConfig> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return NebStore.createForAppservice(request.appserviceId, request.adminUrl).catch(err => {
                LogService.error("DimensionNebAdminService", err);
                throw new ApiError(500, "Error creating go-neb instance");
            });
        }).then(config => {
            Cache.for(CACHE_NEB).clear();
            return config;
        });
    }
}