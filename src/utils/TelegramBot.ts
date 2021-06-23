import Telegraf, { Telegram } from "telegraf";
import config from "../config";
import * as path from "path";

export interface TelegramStickerPack {
    name: string;
    description: string;
    stickers: {
        url: string;
        emoji: string;
    }[];
}

export class TelegramBot {

    private bot: Telegram;

    constructor() {
        const tg = new Telegraf(config.telegram.botToken);
        this.bot = tg.telegram;
    }

    public async getStickerPack(packUrl: string): Promise<TelegramStickerPack> {
        let setName;
        if (packUrl.startsWith("tg://")) {
            setName = new URL(packUrl).searchParams.get("set");
        } else {
            setName = path.basename(packUrl);
        }

        const set = await this.bot.getStickerSet(setName);
        const pack: TelegramStickerPack = {
            name: set.name,
            description: set.title,
            stickers: [],
        };

        for (const tgSticker of set.stickers) {
            pack.stickers.push({
                url: await this.bot.getFileLink(tgSticker.file_id),
                emoji: tgSticker.emoji,
            });
        }

        return pack;
    }
}