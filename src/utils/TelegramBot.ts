import config from "../config";
import * as path from "path";
import { Telegraf, Telegram } from "telegraf";

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
        const set = await this.bot.getStickerSet(path.basename(packUrl));
        const pack: TelegramStickerPack = {
            name: set.name,
            description: set.title,
            stickers: [],
        };

        for (const tgSticker of set.stickers) {
            pack.stickers.push({
                url: await (await this.bot.getFileLink(tgSticker.file_id)).toString(),
                emoji: tgSticker.emoji,
            });
        }

        return pack;
    }
}