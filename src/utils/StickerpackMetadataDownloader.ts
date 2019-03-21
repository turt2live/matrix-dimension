import * as request from "request-promise";

export interface StickerpackMetadata {
    creatorId: string;
    roomId: string;
    roomAlias: string;
}

export class StickerpackMetadataDownloader {
    public static getMetadata(packUrl: string): Promise<StickerpackMetadata> {
        return request({
            uri: packUrl,
            headers: {
                'Accept': 'application/json',
            },
            json: true,
        }).then(body => {
            if (!body || !body["io.t2bot.dimension"]) {
                throw new Error("Failed to locate Dimension metadata");
            }

            return body["io.t2bot.dimension"];
        });
    }
}