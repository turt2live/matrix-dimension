import CustomSimpleBotRecord from "./models/CustomSimpleBotRecord";
import { Cache, CACHE_SIMPLE_BOTS } from "../MemoryCache";
import { MatrixLiteClient } from "../matrix/MatrixLiteClient";
import config from "../config";
import * as randomString from "random-string";
import { LogService } from "matrix-js-snippets";

export interface CachedSimpleBot extends SimpleBotTemplate {
    id: number;
    type: string;
}

export interface SimpleBotTemplate {
    name: string;
    avatarUrl: string;
    description: string;
    isEnabled: boolean;
    isPublic: boolean;
    userId: string;
    accessToken: string;
}

export interface CachedProfile {
    userId: string;
    displayName: string;
    avatarMxc: string;
}

export class BotStore {

    public static readonly TYPE_PREFIX = "custom_";

    public static async createCustom(template: SimpleBotTemplate): Promise<CachedSimpleBot> {
        const newType = `${BotStore.TYPE_PREFIX}${randomString({length: 32})}`;
        const bot = await CustomSimpleBotRecord.create({...template, type: newType});
        return BotStore.mapAndCacheCustom(bot);
    }

    public static async updateCustom(id: number, template: SimpleBotTemplate): Promise<CachedSimpleBot> {
        const record = await CustomSimpleBotRecord.findByPrimary(id);
        if (!record) return null;

        record.name = template.name;
        record.avatarUrl = template.avatarUrl;
        record.description = template.description;
        record.isEnabled = template.isEnabled;
        record.isPublic = template.isPublic;
        record.userId = template.userId;
        record.accessToken = template.accessToken;
        await record.save();

        return BotStore.mapAndCacheCustom(record);
    }

    public static async deleteCustom(id: number): Promise<any> {
        const record = await CustomSimpleBotRecord.findByPrimary(id);
        if (!record) return null;

        await record.destroy();
        Cache.for(CACHE_SIMPLE_BOTS).del("bots");
        return true;
    }

    public static async removeCustomByTypeFromRoom(type: string, roomId: string): Promise<any> {
        const record = await CustomSimpleBotRecord.findOne({where: {type: type}});
        if (!record) return null;

        try {
            const client = new MatrixLiteClient(record.accessToken);
            await client.leaveRoom(roomId);
        } catch (e) {
            LogService.error("BotStore", "Error leaving room " + roomId + " for integration type " + type);
            LogService.error("BotStore", e);
            throw new Error("Error leaving room");
        }
    }

    public static async getCustomBot(id: number): Promise<CachedSimpleBot> {
        const bots = await BotStore.getCustomBots();
        return bots.find(b => b.id === id);
    }

    public static async getCustomBots(): Promise<CachedSimpleBot[]> {
        if (!Cache.for(CACHE_SIMPLE_BOTS).get("bots")) {
            const bots = await CustomSimpleBotRecord.findAll();
            const cached = [];
            await Promise.all(bots.map(async (b) => {
                cached.push(await BotStore.mapAndCacheCustom(b));
                return Promise.resolve();
            }));
            Cache.for(CACHE_SIMPLE_BOTS).put("bots", cached);
        }

        return Cache.for(CACHE_SIMPLE_BOTS).get("bots").map(b => BotStore.cloneBot(b));
    }

    public static async getProfile(userId: string): Promise<CachedProfile> {
        const key = "profile_" + userId;
        if (!Cache.for(CACHE_SIMPLE_BOTS).get(key)) {
            const client = new MatrixLiteClient(config.homeserver.accessToken);
            const profile = await client.getProfile(userId);
            const cached = {userId, displayName: profile.displayname, avatarMxc: profile.avatar_url};
            Cache.for(CACHE_SIMPLE_BOTS).put(key, cached);
        }

        return Cache.for(CACHE_SIMPLE_BOTS).get(key);
    }

    private static async mapAndCacheCustom(bot: CustomSimpleBotRecord): Promise<CachedSimpleBot> {
        Cache.for(CACHE_SIMPLE_BOTS).del("bots");
        return {
            id: bot.id,
            type: bot.type,
            name: bot.name,
            avatarUrl: bot.avatarUrl,
            description: bot.description,
            isEnabled: bot.isEnabled,
            isPublic: bot.isPublic,
            userId: bot.userId,
            accessToken: bot.accessToken,
        };
    }

    private static cloneBot(bot: CachedSimpleBot): CachedSimpleBot {
        return {
            id: bot.id,
            type: bot.type,
            name: bot.name,
            avatarUrl: bot.avatarUrl,
            description: bot.description,
            isEnabled: bot.isEnabled,
            isPublic: bot.isPublic,
            userId: bot.userId,
            accessToken: bot.accessToken,
        };
    }


    private constructor() {
    }
}