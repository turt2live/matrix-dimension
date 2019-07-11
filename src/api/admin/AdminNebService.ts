import { Context, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_INTEGRATIONS, CACHE_NEB } from "../../MemoryCache";
import { NebStore } from "../../db/NebStore";
import { NebConfig } from "../../models/neb";
import { LogService } from "matrix-js-snippets";
import { ApiError } from "../ApiError";
import { ROLE_MSC_ADMIN, ROLE_MSC_USER } from "../security/MSCSecurity";

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


/**
 * Administrative API for configuring go-neb instances.
 */
@Path("/api/v1/dimension/admin/neb")
export class AdminNebService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getNebConfigs(): Promise<NebConfig[]> {
        const cachedConfigs = Cache.for(CACHE_NEB).get("configurations");
        if (cachedConfigs) return cachedConfigs;

        const configs = await NebStore.getAllConfigs();
        Cache.for(CACHE_NEB).put("configurations", configs);
        return configs;
    }

    @GET
    @Path(":id/config")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getNebConfig(@PathParam("id") nebId: number): Promise<NebConfig> {
        const configs = await this.getNebConfigs();
        const firstConfig = configs.filter(c => c.id === nebId)[0];
        if (!firstConfig) throw new ApiError(404, "Configuration not found");
        return firstConfig;
    }

    @POST
    @Path(":id/integration/:type/enabled")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async setIntegrationEnabled(@PathParam("id") nebId: number, @PathParam("type") integrationType: string, request: SetEnabledRequest): Promise<any> {
        const userId = this.context.request.user.userId;

        await NebStore.setIntegrationEnabled(nebId, integrationType, request.enabled);
        LogService.info("AdminNebService", userId + " set the " + integrationType + " on NEB " + nebId + " to " + (request.enabled ? "enabled" : "disabled"));

        Cache.for(CACHE_NEB).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @POST
    @Path(":id/integration/:type/config")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async setIntegrationConfig(@PathParam("id") nebId: number, @PathParam("type") integrationType: string, newConfig: any): Promise<any> {
        const userId = this.context.request.user.userId;

        await NebStore.setIntegrationConfig(nebId, integrationType, newConfig);
        LogService.info("AdminNebService", userId + " updated the configuration for " + integrationType + " on NEB " + nebId);

        Cache.for(CACHE_NEB).clear();
        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @GET
    @Path(":id/integration/:type/config")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async getIntegrationConfig(@PathParam("id") nebId: number, @PathParam("type") integrationType: string): Promise<any> {
        return NebStore.getIntegrationConfig(nebId, integrationType);
    }

    @POST
    @Path("new/upstream")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async newConfigForUpstream(request: CreateWithUpstream): Promise<NebConfig> {
        const userId = this.context.request.user.userId;

        try {
            const neb = await NebStore.createForUpstream(request.upstreamId);
            LogService.info("AdminNebService", userId + " created a new NEB instance from upstream " + request.upstreamId);

            Cache.for(CACHE_NEB).clear();
            Cache.for(CACHE_INTEGRATIONS).clear();
            return neb;
        } catch (err) {
            LogService.error("DimensionNebAdminService", err);
            throw new ApiError(500, "Error creating go-neb instance");
        }
    }

    @POST
    @Path("new/appservice")
    @Security([ROLE_MSC_USER, ROLE_MSC_ADMIN])
    public async newConfigForAppservice(request: CreateWithAppservice): Promise<NebConfig> {
        const userId = this.context.request.user.userId;

        try {
            const neb = await NebStore.createForAppservice(request.appserviceId, request.adminUrl);
            LogService.info("AdminNebService", userId + " created a new NEB instance from appservice " + request.appserviceId);

            Cache.for(CACHE_NEB).clear();
            Cache.for(CACHE_INTEGRATIONS).clear();
            return neb;
        } catch (err) {
            LogService.error("DimensionNebAdminService", err);
            throw new ApiError(500, "Error creating go-neb instance");
        }
    }
}