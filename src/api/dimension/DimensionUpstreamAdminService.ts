import { GET, Path, POST, QueryParam } from "typescript-rest";
import { DimensionAdminService } from "./DimensionAdminService";
import { Cache, CACHE_UPSTREAM } from "../../MemoryCache";
import Upstream from "../../db/models/Upstream";

interface UpstreamRepsonse {
    id: number;
    name: string;
    type: string;
    scalarUrl: string;
    apiUrl: string;
}

interface NewUpstreamRequest {
    name: string;
    type: string;
    scalarUrl: string;
    apiUrl: string;
}

@Path("/api/v1/dimension/admin/upstreams")
export class DimensionUpstreamAdminService {

    @GET
    @Path("all")
    public async getUpstreams(@QueryParam("scalar_token") scalarToken: string): Promise<UpstreamRepsonse[]> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);

        const cachedUpstreams = Cache.for(CACHE_UPSTREAM).get("upstreams");
        if (cachedUpstreams) return cachedUpstreams;

        const upstreams = await Upstream.findAll();
        const mapped = upstreams.map(u => this.mapUpstream(u));
        Cache.for(CACHE_UPSTREAM).put("upstreams", mapped);
        return mapped;
    }

    @POST
    @Path("new")
    public async createUpstream(@QueryParam("scalar_token") scalarToken: string, request: NewUpstreamRequest): Promise<UpstreamRepsonse> {
        await DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken);

        const upstream = await Upstream.create({
            name: request.name,
            type: request.type,
            scalarUrl: request.scalarUrl,
            apiUrl: request.apiUrl,
        });

        Cache.for(CACHE_UPSTREAM).clear();
        return this.mapUpstream(upstream);
    }

    private mapUpstream(upstream: Upstream): UpstreamRepsonse {
        return {
            id: upstream.id,
            name: upstream.name,
            type: upstream.type,
            scalarUrl: upstream.scalarUrl,
            apiUrl: upstream.apiUrl
        };
    }
}