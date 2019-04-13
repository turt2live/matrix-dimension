import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { AuthedApi } from "../authed-api";
import { FE_StickerPack } from "../../models/integration";
import { map } from "rxjs/operators";

@Injectable()
export class AdminStickersApiService extends AuthedApi {
    constructor(http: Http) {
        super(http);
    }

    public getAllPacks(): Promise<FE_StickerPack[]> {
        return this.authedGet("/api/v1/dimension/admin/stickers/packs")
            .pipe(map(r => r.json())).toPromise();
    }

    public togglePack(packId: number, isEnabled: boolean): Promise<any> {
        return this.authedPost("/api/v1/dimension/admin/stickers/packs/" + packId + "/enabled", {isEnabled: isEnabled})
            .pipe(map(r => r.json())).toPromise();
    }

    public importFromTelegram(packUrl: string): Promise<FE_StickerPack> {
        return this.authedPost("/api/v1/dimension/admin/stickers/packs/import/telegram", {packUrl: packUrl})
            .pipe(map(r => r.json())).toPromise();
    }
}
