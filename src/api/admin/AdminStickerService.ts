import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import { Cache, CACHE_STICKERS } from "../../MemoryCache";
import StickerPack from "../../db/models/StickerPack";
import Sticker from "../../db/models/Sticker";
import { ApiError } from "../ApiError";

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
}

interface SetEnabledRequest {
    isEnabled: boolean;
}

/**
 * Administrative API for configuring stickers
 */
@Path("/api/v1/dimension/admin/stickers")
export class AdminStickerService {

    public static async getStickerPacks(enabledOnly: boolean = false): Promise<MemoryStickerPack[]> {
        const cachedPacks = Cache.for(CACHE_STICKERS).get("packs");
        if (cachedPacks) {
            if (enabledOnly) return cachedPacks.filter(p => p.isEnabled);
            return cachedPacks;
        }

        const dbPacks = await StickerPack.findAll();
        const packs: MemoryStickerPack[] = [];
        for (const pack of dbPacks) {
            const stickers = await Sticker.findAll({where: {packId: pack.id}});
            packs.push(<MemoryStickerPack>{
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
            });
        }

        Cache.for(CACHE_STICKERS).put("packs", packs);
        if (enabledOnly) return packs.filter(p => p.isEnabled);
        return packs;
    }

    @GET
    @Path("packs")
    public async getStickerPacks(@QueryParam("scalar_token") scalarToken: string): Promise<MemoryStickerPack[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return await AdminStickerService.getStickerPacks();
    }

    @POST
    @Path("packs/:id/enabled")
    public async setPackEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") packId: number, request: SetEnabledRequest): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        const pack = await StickerPack.findByPrimary(packId);
        if (!pack) throw new ApiError(404, "Sticker pack not found");

        pack.isEnabled = request.isEnabled;
        await pack.save();

        return {}; // 200 OK
    }
}