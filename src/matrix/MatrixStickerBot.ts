import {
    AutojoinUpgradedRoomsMixin,
    LogService,
    MatrixClient,
    SimpleFsStorageProvider,
    SimpleRetryJoinStrategy
} from "matrix-bot-sdk";
import config from "../config";
import StickerPack from "../db/models/StickerPack";
import Sticker from "../db/models/Sticker";
import { MatrixLiteClient } from "./MatrixLiteClient";
import { Cache, CACHE_STICKERS } from "../MemoryCache";
import { LicenseMap } from "../utils/LicenseMap";
import { OpenId } from "../models/OpenId";
import * as sharp from "sharp";

class _MatrixStickerBot {

    private readonly client: MatrixClient;
    private updatingPackIds: { [packId: string]: boolean } = {};

    constructor() {
        this.client = new MatrixClient(
            config.homeserver.clientServerUrl,
            config.homeserver.accessToken,
            new SimpleFsStorageProvider(config.database.botData));

        this.client.setJoinStrategy(new SimpleRetryJoinStrategy());
        this.client.on("room.event", this.onEvent.bind(this));
        AutojoinUpgradedRoomsMixin.setupOnClient(this.client);
    }

    public start(): Promise<any> {
        return this.client.start().then(() => LogService.info("MatrixStickerBot", "Sticker bot started"));
    }

    public getUserId(): Promise<string> {
        return this.client.getUserId();
    }

    public getOpenId(): Promise<OpenId> {
        const liteClient = new MatrixLiteClient(config.homeserver.accessToken);
        return liteClient.getOpenId();
    }

    private async onEvent(roomId, event) {
        LogService.info("MatrixStickerBot", `Event ${event.type} in ${roomId}`);
        if (event.type !== "io.t2bot.stickers.metadata" || event.state_key !== "") return;

        const canonicalAlias = await this.client.getRoomStateEvent(roomId, "m.room.canonical_alias", "");
        const stickerPacks = await StickerPack.findAll({where: {trackingRoomAlias: canonicalAlias.alias}});

        if (stickerPacks.length > 0) {
            return this.updateStickersInPacks(stickerPacks, roomId);
        }
    }

    public trackStickerpack(alias: string): Promise<any> {
        return this.client.joinRoom(alias).then(async (roomId) => {
            const stickerPacks = await StickerPack.findAll({where: {trackingRoomAlias: alias}});
            if (stickerPacks.length > 0) {
                return this.updateStickersInPacks(stickerPacks, roomId);
            } else {
                const pack = await StickerPack.create({
                    type: "stickerpack",
                    name: "PLACEHOLDER",
                    description: "PLACEHOLDER",
                    avatarUrl: "mxc://localhost/NotYetLoaded",
                    isEnabled: false,
                    isPublic: true,
                    authorType: "matrix",
                    authorName: await this.getUserId(),
                    authorReference: "https://matrix.to/#/" + (await this.getUserId()),
                    license: "Imported",
                    licensePath: "/assets/licenses/general-imported.txt",
                    trackingRoomAlias: alias,
                });
                return this.updateStickersInPacks([pack], roomId);
            }
        });
    }

    private async updateStickersInPacks(stickerPacks: StickerPack[], roomId: string) {
        if (this.updatingPackIds[roomId]) return;
        this.updatingPackIds[roomId] = true;

        try {
            const nameEvent = await this.client.getRoomStateEvent(roomId, "m.room.name", "");
            if (!nameEvent) return null;

            const canconicalAliasEvent = await this.client.getRoomStateEvent(roomId, "m.room.canonical_alias", "");
            if (!canconicalAliasEvent) return null;

            const packEvent = await this.client.getRoomStateEvent(roomId, "io.t2bot.stickers.metadata", "");
            if (!packEvent) return null;

            let authorDisplayName = packEvent.creatorId;
            try {
                const profile = await this.client.getUserProfile(packEvent.creatorId);
                if (profile && profile.displayname) authorDisplayName = profile.displayname;
            } catch (e) {
                LogService.warn("MatrixStickerBot", e);
            }

            const mx = new MatrixLiteClient(config.homeserver.accessToken);

            const stickerEvents = [];
            for (const stickerId of packEvent.activeStickers) {
                const stickerEvent = await this.client.getRoomStateEvent(roomId, "io.t2bot.stickers.sticker", stickerId);
                if (!stickerEvent) continue;

                const mxc = stickerEvent.contentUri;
                if (!mxc.startsWith("mxc://")) continue;

                const serverName = mxc.substring("mxc://".length).split("/")[0];
                const contentId = mxc.substring("mxc://".length).split("/")[1];

                const url = await mx.getMediaUrl(serverName, contentId);
                const downImage = await mx.downloadFromUrl(url);
                
                var mime = mx.parseFileHeaderMIME(downImage);
                if (!mime) continue;

                const origImage = await sharp(downImage, {animated: true});
                const metadata = await origImage.metadata();
                var size = metadata.height;
                if (metadata.width > metadata.height) {
                    metadata.width;
                }
                if (size > 512) size = 512;
                const resizedImage = await origImage.resize({
                    width: size,
                    height: size,
                    fit: 'contain',
                    background: 'rgba(0,0,0,0)',
                });
                var imageUpload;
                var thumbUpload;
                if (mime === "image/png") {
                    imageUpload = await resizedImage.png().toBuffer();
                    thumbUpload = imageUpload;
                }
                if (mime === "image/gif" || mime === "image/webp" || mime === "image/avif-sequence") {
                    imageUpload = await resizedImage.webp({quality: 60, effort: 6}).toBuffer();
                    thumbUpload = await sharp(downImage, {animated: false}).resize({
                        width: size,
                        height: size,
                        fit: 'contain',
                        background: 'rgba(0,0,0,0)',
                    }).webp({quality: 50}).toBuffer();
                    mime = "image/webp";
                }
                if (mime === "image/avif") {
                    imageUpload = await resizedImage.clone().avif({quality: 70}).toBuffer();
                    thumbUpload = await resizedImage.avif({quality: 50, chromaSubsampling: '4:2:0'}).toBuffer();;
                }
                if (mime === "image/jpeg") {
                    imageUpload = await resizedImage.clone().jpeg({quality: 80, chromaSubsampling: '4:4:4'}).toBuffer();
                    thumbUpload = await resizedImage.avif({quality: 60, chromaSubsampling: '4:2:0'}).toBuffer();;
                }
                stickerEvent.contentUri = await mx.upload(imageUpload, mime);
                stickerEvent.mimetype = mime;
                stickerEvent.thumbMxc = await mx.upload(thumbUpload, mime);

                stickerEvents.push(stickerEvent);
            }

            const creatorId = packEvent.creatorId;
            const authorName = packEvent.authorName || packEvent.creatorId;
            const authorUrl = packEvent.authorUrl || `https://matrix.to/#/${packEvent.creatorId}`;
            const authorIsCreator = creatorId === authorName;

            let license = LicenseMap.find(packEvent.license || "");
            if (!license) license = LicenseMap.find(LicenseMap.LICENSE_IMPORTED);

            for (const pack of stickerPacks) {
                pack.isEnabled = true;
                pack.trackingRoomAlias = canconicalAliasEvent.alias;
                pack.name = nameEvent.name;
                if (authorIsCreator) {
                    pack.authorType = "matrix";
                    pack.authorReference = "https://matrix.to/#/" + packEvent.creatorId;
                    pack.authorName = authorDisplayName;
                } else {
                    pack.authorType = "website";
                    pack.authorReference = authorUrl;
                    pack.authorName = authorName;
                }
                pack.description = "Matrix sticker pack created by " + authorDisplayName;
                pack.license = license.name;
                pack.licensePath = license.url;
                if (stickerEvents.length > 0) pack.avatarUrl = stickerEvents[0].thumbMxc;
                await pack.save();

                const existingStickers = await Sticker.findAll({where: {packId: pack.id}});
                for (const sticker of existingStickers) await sticker.destroy();

                for (const stickerEvent of stickerEvents) {
                    await Sticker.create({
                        packId: pack.id,
                        name: stickerEvent.description,
                        description: stickerEvent.description,
                        imageMxc: stickerEvent.contentUri,
                        thumbnailMxc: stickerEvent.thumbMxc,
                        thumbnailWidth: 512,
                        thumbnailHeight: 512,
                        mimetype: stickerEvent.mimetype,
                    });
                }
            }

            LogService.info("MatrixStickerBot", `Updated ${stickerPacks.length} stickerpacks`);
            Cache.for(CACHE_STICKERS).clear();
        } catch (e) {
            LogService.error("MatrixStickerBot", e);
        }

        delete this.updatingPackIds[roomId];
    }
}

export const MatrixStickerBot = new _MatrixStickerBot();
