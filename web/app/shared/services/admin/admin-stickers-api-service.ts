import { Injectable } from "@angular/core";
import { AuthedApi } from "../authed-api";
import { FE_StickerPack } from "../../models/integration";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AdminStickersApiService extends AuthedApi {
    constructor(http: HttpClient) {
        super(http);
    }

    public getAllPacks(): Promise<FE_StickerPack[]> {
        return this.authedGet<FE_StickerPack[]>("/api/v1/dimension/admin/stickers/packs").toPromise();
    }

    public togglePack(packId: number, isEnabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/stickers/packs/" + packId + "/enabled", {isEnabled: isEnabled}).toPromise();
    }

    public importFromTelegram(packUrl: string): Promise<FE_StickerPack> {
        return this.authedPost<FE_StickerPack>("/api/v1/dimension/admin/stickers/packs/import/telegram", {packUrl: packUrl}).toPromise();
    }

    public removePack(packId: number): Promise<any> {
        return this.authedDelete("/api/v1/dimension/admin/stickers/packs/" + packId).toPromise();
    }
}
