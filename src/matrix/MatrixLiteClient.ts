import { doFederatedApiCall, getFederationUrl as getFedUrl } from "./helpers";

export interface MatrixUrlPreview {
    // This is really the only parameter we care about
    "og:title"?: string;
}

export class MatrixLiteClient {

    constructor(private homeserverName: string, private accessToken: string) {
    }

    public async getFederationUrl(): Promise<string> {
        return getFedUrl(this.homeserverName);
    }

    public async getUrlPreview(url: string): Promise<MatrixUrlPreview> {
        return doFederatedApiCall(
            "GET",
            this.homeserverName,
            "/_matrix/media/r0/preview_url",
            {access_token: this.accessToken, url: url}
        );
    }

    public async whoAmI(): Promise<string> {
        const response = await doFederatedApiCall(
            "GET",
            this.homeserverName,
            "/_matrix/client/r0/account/whoami",
            {access_token: this.accessToken}
        );
        return response['user_id'];
    }
}
