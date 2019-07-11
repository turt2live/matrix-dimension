import { Context, GET, Path, PathParam, POST, Security, ServiceContext } from "typescript-rest";
import { Cache, CACHE_STICKERS } from "../../MemoryCache";
import StickerPack from "../../db/models/StickerPack";
import Sticker from "../../db/models/Sticker";
import UserStickerPack from "../../db/models/UserStickerPack";
import { ApiError } from "../ApiError";
import { StickerpackMetadataDownloader } from "../../utils/StickerpackMetadataDownloader";
import { MatrixStickerBot } from "../../matrix/MatrixStickerBot";
import config from "../../config";
import { ROLE_USER } from "../security/MatrixSecurity";

export interface MemoryStickerPack {
    id: number;
    displayName: string;
    avatarUrl: string;
    description: string;
    isEnabled: boolean;
    author: {
        type: string;
        name: string;
        reference: string;
    };
    license: {
        name: string;
        urlPath: string;
    };
    stickers: {
        id: number;
        name: string;
        description: string;
        image: {
            mxc: string;
            mimetype: string;
        };
        thumbnail: {
            mxc: string;
            width: number;
            height: number;
        };
    }[];
    trackingRoomAlias: string;
}

export interface MemoryUserStickerPack extends MemoryStickerPack {
    isSelected: boolean;
}

interface SetSelectedRequest {
    isSelected: boolean;
}

interface ImportPackRequest {
    packUrl: string;
}

interface StickerConfig {
    enabled: boolean;
    stickerBot: string;
    managerUrl: string;
}

/**
 * API for stickers
 */
@Path("/api/v1/dimension/stickers")
export class DimensionStickerService {

    @Context
    private context: ServiceContext;

    public static async getStickerPacks(enabledOnly = false): Promise<MemoryStickerPack[]> {
        const cachedPacks = Cache.for(CACHE_STICKERS).get("packs");
        if (cachedPacks) {
            if (enabledOnly) return cachedPacks.filter(p => p.isEnabled);
            return cachedPacks;
        }

        const dbPacks = await StickerPack.findAll();
        const packs: MemoryStickerPack[] = [];
        for (const pack of dbPacks) {
            packs.push(await DimensionStickerService.packToMemory(pack));
        }

        Cache.for(CACHE_STICKERS).put("packs", packs);
        if (enabledOnly) return packs.filter(p => p.isEnabled);
        return packs;
    }

    @GET
    @Path("config")
    @Security(ROLE_USER)
    public async getConfig(): Promise<StickerConfig> {
        return {
            enabled: config.stickers.enabled,
            stickerBot: config.stickers.stickerBot,
            managerUrl: config.stickers.managerUrl,
        };
    }

    @GET
    @Path("packs")
    @Security(ROLE_USER)
    public async getStickerPacks(): Promise<MemoryStickerPack[]> {
        const userId = this.context.request.user.userId;
        const cachedPacks = Cache.for(CACHE_STICKERS).get("packs_" + userId);
        if (cachedPacks) return cachedPacks;

        const allPacks = await DimensionStickerService.getStickerPacks(true);
        if (allPacks.length === 0) return []; // We can just skip the database call

        const userPacks = await UserStickerPack.findAll({where: {userId: userId, isSelected: true}});

        const packs: MemoryUserStickerPack[] = [];
        for (const pack of allPacks) {
            const userPack = userPacks.find(p => p.packId === pack.id);

            const selectedPack = JSON.parse(JSON.stringify(pack));
            selectedPack.isSelected = userPack ? userPack.isSelected : false;
            if (!selectedPack.isSelected && pack.trackingRoomAlias) continue;
            packs.push(selectedPack);
        }

        Cache.for(CACHE_STICKERS).put("packs_" + userId, packs);
        return packs;
    }

    @POST
    @Path("packs/:packId/selected")
    @Security(ROLE_USER)
    public async setPackSelected(@PathParam("packId") packId: number, request: SetSelectedRequest): Promise<any> {
        const userId = this.context.request.user.userId;
        const pack = await StickerPack.findByPk(packId);
        if (!pack) throw new ApiError(404, "Sticker pack not found");

        let userPack = await UserStickerPack.findOne({where: {userId: userId, packId: packId}});
        if (!userPack) {
            userPack = await UserStickerPack.create({
                packId: packId,
                userId: userId,
                isSelected: false,
            });
        }

        userPack.isSelected = request.isSelected;
        await userPack.save();
        Cache.for(CACHE_STICKERS).del("packs_" + userId);

        return {}; // 200 OK
    }

    @POST
    @Path("packs/import")
    @Security(ROLE_USER)
    public async importPack(request: ImportPackRequest): Promise<MemoryUserStickerPack> {
        if (!config.stickers.enabled) {
            throw new ApiError(400, "Custom stickerpacks are disabled on this homeserver");
        }

        const packUrl = request.packUrl.endsWith(".json") ? request.packUrl : `${request.packUrl}.json`;
        const metadata = await StickerpackMetadataDownloader.getMetadata(packUrl);
        await MatrixStickerBot.trackStickerpack(metadata.roomAlias);

        const stickerPacks = await StickerPack.findAll({where: {trackingRoomAlias: metadata.roomAlias}});
        Cache.for(CACHE_STICKERS).clear();

        if (stickerPacks.length <= 0) throw new ApiError(500, "Stickerpack not imported");
        const pack = stickerPacks[0];

        // Simulate a call to setPackSelected
        await this.setPackSelected(pack.id, {isSelected: true});

        const memoryPack = await DimensionStickerService.packToMemory(pack);
        return Object.assign({isSelected: true}, memoryPack);
    }

    public static async packToMemory(pack: StickerPack): Promise<MemoryStickerPack> {
        const stickers = await Sticker.findAll({where: {packId: pack.id}});
        return {
            id: pack.id,
            displayName: pack.name,
            avatarUrl: pack.avatarUrl,
            description: pack.description,
            isEnabled: pack.isEnabled,
            author: {
                type: pack.authorType,
                name: pack.authorName,
                reference: pack.authorReference,
            },
            license: {
                name: pack.license,
                urlPath: pack.licensePath,
            },
            stickers: stickers.map(s => {
                return {
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    image: {
                        mxc: s.imageMxc,
                        mimetype: s.mimetype,
                    },
                    thumbnail: {
                        mxc: s.thumbnailMxc,
                        width: s.thumbnailWidth,
                        height: s.thumbnailHeight,
                    },
                }
            }),
            trackingRoomAlias: pack.trackingRoomAlias,
        };
    }

}