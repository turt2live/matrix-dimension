import { DELETE, GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-js-snippets";
import { BotStore } from "../../db/BotStore";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";

interface BotResponse extends BotRequest {
    id: number;
    type: string;
}

interface BotRequest {
    name: string;
    avatarUrl: string;
    description: string;
    isEnabled: boolean;
    isPublic: boolean;
    userId: string;
    accessToken: string;
}

interface BotProfile {
    name: string;
    avatarUrl: string;
}

/**
 * Administrative API for managing custom simple bots hosted by Dimension
 */
@Path("/api/v1/dimension/admin/bots/simple/custom")
export class AdminCustomSimpleBotService {

    @GET
    @Path("all")
    public async getBots(@QueryParam("scalar_token") scalarToken: string): Promise<BotResponse[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return BotStore.getCustomBots();
    }

    @GET
    @Path(":botId")
    public async getBot(@QueryParam("scalar_token") scalarToken: string, @PathParam("botId") botId: number): Promise<BotResponse> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bot = await BotStore.getCustomBot(botId);
        if (!bot) throw new ApiError(404, "Bot not found");
        return bot;
    }

    @POST
    @Path("new")
    public async createBot(@QueryParam("scalar_token") scalarToken: string, request: BotRequest): Promise<BotResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bot = await BotStore.createCustom(request);
        LogService.info("AdminCustomSimpleBotService", userId + " created a simple bot");
        Cache.for(CACHE_INTEGRATIONS).clear();
        return bot;
    }

    @POST
    @Path(":botId")
    public async updateBot(@QueryParam("scalar_token") scalarToken: string, @PathParam("botId") botId: number, request: BotRequest): Promise<BotResponse> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const bot = await BotStore.updateCustom(botId, request);
        LogService.info("AdminCustomSimpleBotService", userId + " updated a simple bot");
        Cache.for(CACHE_INTEGRATIONS).clear();
        return bot;
    }

    @DELETE
    @Path(":botId")
    public async deleteBot(@QueryParam("scalar_token") scalarToken: string, @PathParam("botId") botId: number): Promise<any> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        await BotStore.deleteCustom(botId);
        LogService.info("AdminCustomSimpleBotService", userId + " deleted a simple bot");
        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @GET
    @Path("profile/:userId")
    public async getProfile(@QueryParam("scalar_token") scalarToken: string, @PathParam("userId") userId: string): Promise<BotProfile> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        const profile = await BotStore.getProfile(userId);
        return {name: profile.displayName, avatarUrl: profile.avatarMxc};
    }
}