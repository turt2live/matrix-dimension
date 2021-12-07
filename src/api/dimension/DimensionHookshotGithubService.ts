import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-bot-sdk";
import { ROLE_USER } from "../security/MatrixSecurity";
import {
    HookshotGithubAuthUrls,
    HookshotGithubOrgReposDto,
    HookshotGithubRepo,
    HookshotGithubRoomConfig
} from "../../bridges/models/hookshot";
import { HookshotGithubBridge } from "../../bridges/HookshotGithubBridge";

interface BridgeRoomRequest {
    orgId: string;
    repoId: string;
}

/**
 * API for interacting with the Hookshot/Github bridge
 */
@Path("/api/v1/dimension/hookshot/github")
export class DimensionHookshotGithubService {

    @Context
    private context: ServiceContext;

    @GET
    @Path("auth")
    @Security(ROLE_USER)
    public async getAuthUrls(): Promise<HookshotGithubAuthUrls> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            return await hookshot.getAuthUrls();
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error getting auth info");
        }
    }

    @GET
    @Path("locations")
    @Security(ROLE_USER)
    public async getUserRepos(): Promise<{ locations: HookshotGithubOrgReposDto[] }> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            const locations = await hookshot.getInstalledLocations();
            return {locations};
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error getting repo information", "T2B_MISSING_AUTH");
        }
    }

    @POST
    @Path("room/:roomId/connect")
    @Security(ROLE_USER)
    public async bridgeRoom(@PathParam("roomId") roomId: string, request: BridgeRoomRequest): Promise<HookshotGithubRoomConfig> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            return hookshot.bridgeRoom(roomId, request.orgId, request.repoId);
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error bridging room");
        }
    }

    @DELETE
    @Path("room/:roomId/connections/all")
    @Security(ROLE_USER)
    public async unbridgeRoom(@PathParam("roomId") roomId: string): Promise<any> {
        const userId = this.context.request.user.userId;

        try {
            const hookshot = new HookshotGithubBridge(userId);
            const connections = await hookshot.getRoomConfigurations(roomId);
            for (const conn of connections) {
                await hookshot.unbridgeRoom(roomId, conn.id);
            }
            return {}; // 200 OK
        } catch (e) {
            LogService.error("DimensionHookshotGithubService", e);
            throw new ApiError(400, "Error unbridging room");
        }
    }
}
