import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";
import Sticker from "../models/Sticker";
import * as sharp from "sharp";
import { MatrixLiteClient } from "../../matrix/MatrixLiteClient";
import config from "../../config";
import { BLURHASH_SIZE, sharpToBlurhash } from "../../utils/blurhash";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.addColumn("dimension_stickers", "blurhash", {
                type: DataType.STRING,
                allowNull: true,
            }))
            .then(async () => {
                let stickers: Sticker[];
                try {
                    stickers = await Sticker.findAll({ where: {} });
                } catch (err) {
                    console.log(err);
                }

                const mx = new MatrixLiteClient(config.homeserver.accessToken);
                // migrate stickers in the background for this will take a while and isn't very important
                stickers.forEach(async sticker => {
                    try {
                        const [serverName, contentId] = sticker.imageMxc.substring("mxc://".length).split("/");
                        const url = await mx.getThumbnailUrl(serverName, contentId, BLURHASH_SIZE, BLURHASH_SIZE, "scale", false);
                        const buffer = await mx.downloadFromUrl(url);
                        const image = await sharp(buffer);
                        const blurhash = await sharpToBlurhash(image);

                        console.log(`[Background Migration] Generated blurhash ${blurhash} for sticker ${sticker.id}`);
                        await sticker.update({ blurhash });
                    } catch (e) {
                        console.warn("[Background Migration] Failed to generate blurhash for ${sticker.id}", e);
                    }
                });
            });
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.removeColumn("dimension_stickers", "blurhash"));
    }
}