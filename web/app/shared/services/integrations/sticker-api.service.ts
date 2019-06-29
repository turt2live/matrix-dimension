import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_StickerConfig, FE_UserStickerPack } from "../../models/integration";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class StickerApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getConfig(): Promise<FE_StickerConfig> {
        return this.authedGet<FE_StickerConfig>("/api/v1/dimension/stickers/config").toPromise();
    }

    public getPacks(): Promise<FE_UserStickerPack[]> {
        return this.authedGet<FE_UserStickerPack[]>("/api/v1/dimension/stickers/packs").toPromise();
    }

    public togglePackSelection(packId: number, isSelected: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/stickers/packs/" + packId + "/selected", {isSelected: isSelected}).toPromise();
    }

    public importStickerpack(packUrl: string): Promise<FE_UserStickerPack> {
        return this.authedPost<FE_UserStickerPack>("/api/v1/dimension/stickers/packs/import", {packUrl}).toPromise();
    }
}
