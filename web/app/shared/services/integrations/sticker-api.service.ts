import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_StickerConfig, FE_UserStickerPack } from "../../models/integration";

@Injectable()
export class StickerApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getConfig(): Promise<FE_StickerConfig> {
        return this.authedGet("/api/v1/dimension/stickers/config").map(r => r.json()).toPromise();
    }

    public getPacks(): Promise<FE_UserStickerPack[]> {
        return this.authedGet("/api/v1/dimension/stickers/packs").map(r => r.json()).toPromise();
    }

    public togglePackSelection(packId: number, isSelected: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/stickers/packs/" + packId + "/selected", {isSelected: isSelected}).map(r => r.json()).toPromise();
    }

    public importStickerpack(packUrl: string): Promise<FE_UserStickerPack> {
        return this.authedPost("/api/v1/dimension/stickers/packs/import", {packUrl}).map(r => r.json()).toPromise();
    }
}
