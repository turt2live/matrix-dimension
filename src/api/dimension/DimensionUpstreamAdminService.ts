import { GET, Path, POST, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
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
    public getUpstreams(@QueryParam("scalar_token") scalarToken: string): Promise<UpstreamRepsonse[]> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            const cachedUpstreams = Cache.for(CACHE_UPSTREAM).get("upstreams");
            if (cachedUpstreams) return cachedUpstreams;
            return Upstream.findAll().then(upstreams => {
                const mapped = upstreams.map(this.mapUpstream);
                Cache.for(CACHE_UPSTREAM).put("upstreams", mapped);

                return mapped;
            });
        });
    }

    @POST
    @Path("new")
    public createUpstream(@QueryParam("scalar_token") scalarToken: string, request: NewUpstreamRequest): Promise<UpstreamRepsonse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return Upstream.create({
                name: request.name,
                type: request.type,
                scalarUrl: request.scalarUrl,
                apiUrl: request.apiUrl,
            });
        }).then(upstream => {
            Cache.for(CACHE_UPSTREAM).clear();
            return this.mapUpstream(upstream);
        });
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