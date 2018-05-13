import { doClientApiCall } from "./helpers";
import config from "../config";

export interface MatrixUrlPreview {
    // This is really the only parameter we care about
    "og:title"?: string;
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
}
