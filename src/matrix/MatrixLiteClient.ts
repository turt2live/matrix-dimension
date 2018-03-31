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
}
