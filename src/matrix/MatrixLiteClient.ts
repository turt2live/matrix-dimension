import { doClientApiCall } from "./helpers";
import config from "../config";
import * as request from "request";
import { LogService } from "matrix-js-snippets";

export interface MatrixUrlPreview {
    // This is really the only parameter we care about
    "og:title"?: string;
}

export interface MatrixUserProfile {
    displayname?: string;
    avatar_url?: string;
}

export class MatrixLiteClient {

    constructor(private accessToken: string) {
    }

    public async getUrlPreview(url: string): Promise<MatrixUrlPreview> {
        return doClientApiCall(
            "GET",
            "/_matrix/media/r0/preview_url",
            {access_token: this.accessToken, url: url}
        );
    }

    public async getThumbnailUrl(serverName: string, contentId: string, width: number, height: number, method: "crop" | "scale", isAnimated: boolean): Promise<string> {
        let baseUrl = config.homeserver.mediaUrl;
        if (!baseUrl) baseUrl = config.homeserver.clientServerUrl;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.substring(0, baseUrl.length - 1);

        // DO NOT RETURN THE ACCESS TOKEN.
        return baseUrl + `/_matrix/media/r0/thumbnail/${serverName}/${contentId}?width=${width}&height=${height}&method=${method}&animated=${isAnimated}`;
    }

    public async whoAmI(): Promise<string> {
        const response = await doClientApiCall(
            "GET",
            "/_matrix/client/r0/account/whoami",
            {access_token: this.accessToken}
        );
        return response['user_id'];
    }

    public async leaveRoom(roomId: string): Promise<string> {
        return doClientApiCall(
            "POST",
            "/_matrix/client/r0/rooms/" + roomId + "/leave",
            {access_token: this.accessToken}
        );
    }

    public async getProfile(userId: string): Promise<MatrixUserProfile> {
        return doClientApiCall(
            "GET",
            "/_matrix/client/r0/profile/" + userId,
            {access_token: this.accessToken},
        );
    }

    public async getDisplayName(): Promise<string> {
        const response = await doClientApiCall(
            "GET",
            "/_matrix/client/r0/profile/" + (await this.whoAmI()) + "/displayname",
            {access_token: this.accessToken},
        );
        return response['displayname'];
    }

    public async getAvatarUrl(): Promise<string> {
        const response = await doClientApiCall(
            "GET",
            "/_matrix/client/r0/profile/" + (await this.whoAmI()) + "/avatar_url",
            {access_token: this.accessToken},
        );
        return response['avatar_url'];
    }

    public async setDisplayName(newDisplayName: string): Promise<any> {
        return doClientApiCall(
            "PUT",
            "/_matrix/client/r0/profile/" + (await this.whoAmI()) + "/displayname",
            {access_token: this.accessToken},
            {displayname: newDisplayName},
        );
    }

    public async setAvatarUrl(newUrl: string): Promise<any> {
        return doClientApiCall(
            "PUT",
            "/_matrix/client/r0/profile/" + (await this.whoAmI()) + "/avatar_url",
            {access_token: this.accessToken},
            {avatar_url: newUrl},
        );
    }

    public async upload(content: Buffer, contentType: string): Promise<string> {
        return doClientApiCall(
            "POST",
            "/_matrix/media/r0/upload",
            {access_token: this.accessToken},
            content,
            contentType,
        ).then(r => r["content_uri"]);
    }

    public async uploadFromUrl(url: string, contentType: string): Promise<string> {
        const buffer = await this.downloadFromUrl(url);
        return this.upload(buffer, contentType);
    }

    public async downloadFromUrl(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            request({
                method: "GET",
                url: url,
                encoding: null,
            }, (err, res, _body) => {
                if (err) {
                    LogService.error("MatrixLiteClient", "Error downloading file from " + url);
                    LogService.error("MatrixLiteClient", err);
                    reject(err);
                } else if (res.statusCode !== 200) {
                    LogService.error("MatrixLiteClient", "Got status code " + res.statusCode + " while calling url " + url);
                    reject(new Error("Error in request: invalid status code"));
                } else {
                    resolve(res.body);
                }
            });
        });
    }
}
