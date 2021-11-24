import { Context, DELETE, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { ApiError } from "../ApiError";
import { LogService } from "matrix-bot-sdk";
import { BotStore } from "../../db/BotStore";
import { Cache, CACHE_INTEGRATIONS } from "../../MemoryCache";
import { ROLE_ADMIN, ROLE_USER } from "../security/MatrixSecurity";

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

    @Context
    private context: ServiceContext;

    @GET
    @Path("all")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBots(): Promise<BotResponse[]> {
        return BotStore.getCustomBots();
    }

    @GET
    @Path(":botId")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getBot(@PathParam("botId") botId: number): Promise<BotResponse> {
        const bot = await BotStore.getCustomBot(botId);
        if (!bot) throw new ApiError(404, "Bot not found");
        return bot;
    }

    @POST
    @Path("new")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async createBot(request: BotRequest): Promise<BotResponse> {
        const userId = this.context.request.user.userId;
        const bot = await BotStore.createCustom(request);
        LogService.info("AdminCustomSimpleBotService", userId + " created a simple bot");
        Cache.for(CACHE_INTEGRATIONS).clear();
        return bot;
    }

    @POST
    @Path(":botId")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async updateBot(@PathParam("botId") botId: number, request: BotRequest): Promise<BotResponse> {
        const userId = this.context.request.user.userId;
        const bot = await BotStore.updateCustom(botId, request);
        LogService.info("AdminCustomSimpleBotService", userId + " updated a simple bot");
        Cache.for(CACHE_INTEGRATIONS).clear();
        return bot;
    }

    @DELETE
    @Path(":botId")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async deleteBot(@PathParam("botId") botId: number): Promise<any> {
        const userId = this.context.request.user.userId;
        await BotStore.deleteCustom(botId);
        LogService.info("AdminCustomSimpleBotService", userId + " deleted a simple bot");
        Cache.for(CACHE_INTEGRATIONS).clear();
        return {}; // 200 OK
    }

    @GET
    @Path("profile/:userId")
    @Security([ROLE_USER, ROLE_ADMIN])
    public async getProfile(@PathParam("userId") userId: string): Promise<BotProfile> {
        const profile = await BotStore.getProfile(userId);
        return {name: profile.displayName, avatarUrl: profile.avatarMxc};
    }
}
