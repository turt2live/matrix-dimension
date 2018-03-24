import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
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
export class AdminNebService {

    @GET
    @Path("all")
    public async getNebConfigs(@QueryParam("scalar_token") scalarToken: string): Promise<NebConfig[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const cachedConfigs = Cache.for(CACHE_NEB).get("configurations");
        if (cachedConfigs) return cachedConfigs;

        const configs = await NebStore.getAllConfigs();
        Cache.for(CACHE_NEB).put("configurations", configs);
        return configs;
    }

    @GET
    @Path(":id/config")
    public async getNebConfig(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") nebId: number): Promise<NebConfig> {
        const configs = await this.getNebConfigs(scalarToken); // does auth for us
        const firstConfig = configs.filter(c => c.id === nebId)[0];
        if (!firstConfig) throw new ApiError(404, "Configuration not found");
        return firstConfig;
    }

    @POST
    @Path(":id/integration/:type/enabled")
    public async setIntegrationEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") nebId: number, @PathParam("type") integrationType: string, request: SetEnabledRequest): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return NebStore.setIntegrationEnabled(nebId, integrationType, request.enabled);
    }

    @POST
    @Path(":id/integration/:type/config")
    public async setIntegrationConfig(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") nebId: number, @PathParam("type") integrationType: string, newConfig: any): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return NebStore.setIntegrationConfig(nebId, integrationType, newConfig);
    }

    @GET
    @Path(":id/integration/:type/config")
    public async getIntegrationConfig(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") nebId: number, @PathParam("type") integrationType: string): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return NebStore.getIntegrationConfig(nebId, integrationType);
    }

    @POST
    @Path("new/upstream")
    public async newConfigForUpstream(@QueryParam("scalar_token") scalarToken: string, request: CreateWithUpstream): Promise<NebConfig> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        try {
            const neb = await NebStore.createForUpstream(request.upstreamId);
            Cache.for(CACHE_NEB).clear();
            return neb;
        } catch (err) {
            LogService.error("DimensionNebAdminService", err);
            throw new ApiError(500, "Error creating go-neb instance");
        }
    }

    @POST
    @Path("new/appservice")
    public async newConfigForAppservice(@QueryParam("scalar_token") scalarToken: string, request: CreateWithAppservice): Promise<NebConfig> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        try {
            const neb = await NebStore.createForAppservice(request.appserviceId, request.adminUrl);
            Cache.for(CACHE_NEB).clear();
            return neb;
        } catch (err) {
            LogService.error("DimensionNebAdminService", err);
            throw new ApiError(500, "Error creating go-neb instance");
        }
    }
}