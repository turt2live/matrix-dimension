import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import StickerPack from "../../db/models/StickerPack";
import { ApiError } from "../ApiError";
import { DimensionStickerService, MemoryStickerPack } from "../dimension/DimensionStickerService";
import { Cache, CACHE_STICKERS } from "../../MemoryCache";

interface SetEnabledRequest {
    isEnabled: boolean;
}

/**
 * Administrative API for configuring stickers
 */
@Path("/api/v1/dimension/admin/stickers")
export class AdminStickerService {

    @GET
    @Path("packs")
    public async getStickerPacks(@QueryParam("scalar_token") scalarToken: string): Promise<MemoryStickerPack[]> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        return await DimensionStickerService.getStickerPacks(false);
    }

    @POST
    @Path("packs/:id/enabled")
    public async setPackEnabled(@QueryParam("scalar_token") scalarToken: string, @PathParam("id") packId: number, request: SetEnabledRequest): Promise<any> {
        await AdminService.validateAndGetAdminTokenOwner(scalarToken);
        const pack = await StickerPack.findByPrimary(packId);
        if (!pack) throw new ApiError(404, "Sticker pack not found");

        pack.isEnabled = request.isEnabled;
        await pack.save();
        Cache.for(CACHE_STICKERS).clear();

        return {}; // 200 OK
    }
}