import {
    AutojoinUpgradedRoomsMixin,
    MatrixClient,
    SimpleFsStorageProvider,
    SimpleRetryJoinStrategy
} from "matrix-bot-sdk";
import config from "../config";
import { LogService } from "matrix-js-snippets";
import StickerPack from "../db/models/StickerPack";
import Sticker from "../db/models/Sticker";
import { MatrixLiteClient } from "./MatrixLiteClient";
import { Cache, CACHE_STICKERS } from "../MemoryCache";
import { LicenseMap } from "../utils/LicenseMap";
import { OpenId } from "../models/OpenId";

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
                    licensePath: "/licenses/general-imported.txt",
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

                const [serverName, contentId] = mxc.substring("mxc://".length).split("/");
                stickerEvent.thumbMxc = await mx.uploadFromUrl(await mx.getThumbnailUrl(serverName, contentId, 512, 512, "scale", false), "image/png");

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
                if (stickerEvents.length > 0) pack.avatarUrl = stickerEvents[0].contentUri;
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
                        blurhash: stickerEvent.blurhash,
                        thumbnailWidth: 512,
                        thumbnailHeight: 512,
                        mimetype: "image/png",
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