import { GET, Path } from "typescript-rest";

@Path("/api/v1/dimension/health")
export class DimensionHealthService {

    @GET
    @Path("heartbeat")
    public async heartbeat(): Promise<any> {
        return {}; // 200 OK
    }
}