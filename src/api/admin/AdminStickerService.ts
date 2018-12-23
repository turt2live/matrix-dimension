import { GET, Path, PathParam, POST, QueryParam } from "typescript-rest";
import { AdminService } from "./AdminService";
import StickerPack from "../../db/models/StickerPack";
import { ApiError } from "../ApiError";
import { DimensionStickerService, MemoryStickerPack } from "../dimension/DimensionStickerService";
import { Cache, CACHE_STICKERS } from "../../MemoryCache";
import { TelegramBot } from "../../utils/TelegramBot";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import config from "../../config";
import Sticker from "../../db/models/Sticker";
import { LogService } from "matrix-js-snippets";
import * as sharp from "sharp";

interface SetEnabledRequest {
    isEnabled: boolean;
}

interface ImportTelegramRequest {
    packUrl: string;
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

    @POST
    @Path("packs/import/telegram")
    public async importFromTelegram(@QueryParam("scalar_token") scalarToken: string, request: ImportTelegramRequest): Promise<MemoryStickerPack> {
        const userId = await AdminService.validateAndGetAdminTokenOwner(scalarToken);

        if (!request.packUrl || (!request.packUrl.startsWith("https://t.me/addstickers/") && !request.packUrl.startsWith("https://telegram.me/addstickers/"))) {
            throw new ApiError(400, "Invalid pack URL");
        }

        const tg = new TelegramBot();
        const mx = new MatrixLiteClient(config.homeserver.accessToken);

        LogService.info("AdminStickerService", "Importing " + request.packUrl + " from Telegram for " + userId);
        const tgPack = await tg.getStickerPack(request.packUrl);

        const pack = await StickerPack.create({
            type: "stickerpack",
            name: tgPack.name,
            description: tgPack.description,
            avatarUrl: "mxc://localhost/NotYetLoaded",
            isEnabled: false,
            isPublic: true,
            authorType: "telegram",
            authorName: "Telegram",
            authorReference: request.packUrl,
            license: "Telegram",
            licensePath: "/licenses/telegram-imported.txt",
        });

        const stickers = [];
        try {
            let avatarUrl = null;
            for (const tgSticker of tgPack.stickers) {
                LogService.info("AdminStickerService", "Importing sticker from " + tgSticker.url);
                const buffer = await mx.downloadFromUrl(tgSticker.url);
                console.log(typeof(buffer));
                const png = await sharp(buffer).png().toBuffer();
                const mxc = await mx.upload(png, "image/png");
                const serverName = mxc.substring("mxc://".length).split("/")[0];
                const contentId = mxc.substring("mxc://".length).split("/")[1];
                const thumbMxc = await mx.uploadFromUrl(await mx.getThumbnailUrl(serverName, contentId, 512, 512, "crop", false), "image/png");

                stickers.push(await Sticker.create({
                    packId: pack.id,
                    name: tgSticker.emoji,
                    description: tgSticker.emoji,
                    imageMxc: mxc,
                    thumbnailMxc: thumbMxc,
                    thumbnailWidth: 512,
                    thumbnailHeight: 512,
                    mimetype: "image/png",
                }));

                if (!avatarUrl) avatarUrl = mxc;
            }

            pack.avatarUrl = avatarUrl;
            await pack.save();
        } catch (e) {
            LogService.error("AdminStickerService", e);
            const thingsToDelete = [pack, ...stickers];
            for (const item of thingsToDelete) {
                try {
                    await item.destroy();
                } catch (e2) {
                    LogService.error("AdminStickerService", e2);
                }
            }
            throw new ApiError(500, "Error importing stickers");
        }

        Cache.for(CACHE_STICKERS).clear();
        return DimensionStickerService.packToMemory(pack);
    }
}