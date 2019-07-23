import { Context, GET, Path, POST, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_SCALAR_ACCOUNTS, CACHE_UPSTREAM } from "../../MemoryCache";
import Upstream from "../../db/models/Upstream";
import { LogService } from "matrix-js-snippets";
import { ROLE_ADMIN, ROLE_USER } from "../security/MatrixSecurity";

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

/**
 * Administrative API for managing the instances upstream of this instance. Particularly
 * useful for configuring the Modular upstream.
 */
@Path("/api/v1/dimension/admin/upstreams")
export class AdminUpstreamService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getUpstreams(): Promise<UpstreamRepsonse[]> {
        const cachedUpstreams = Cache.for(CACHE_UPSTREAM).get("upstreams");
        if (cachedUpstreams) return cachedUpstreams;

        const upstreams = await Upstream.findAll();
        const mapped = upstreams.map(u => this.mapUpstream(u));
        Cache.for(CACHE_UPSTREAM).put("upstreams", mapped);
        return mapped;
    }

    @POST
    @Path("new")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async createUpstream(request: NewUpstreamRequest): Promise<UpstreamRepsonse> {
        const userId = this.context.request.user.userId;

        const upstream = await Upstream.create({
            name: request.name,
            type: request.type,
            scalarUrl: request.scalarUrl,
            apiUrl: request.apiUrl,
        });

        LogService.info("AdminUpstreamService", userId + " created a new upstream");
        Cache.for(CACHE_UPSTREAM).clear();
        Cache.for(CACHE_SCALAR_ACCOUNTS).clear();
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