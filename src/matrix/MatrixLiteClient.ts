import { doClientApiCall } from "./helpers";

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
