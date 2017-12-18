import * as Promise from "bluebird";
import { doFederatedApiCall } from "./helpers";

export interface MatrixUrlPreview {
    // This is really the only parameter we care about
    "og:title"?: string;
}

export class MatrixLiteClient {

    constructor(private homeserverName: string, private accessToken: string) {
    }

    public getUrlPreview(url: string): Promise<MatrixUrlPreview> {
        return doFederatedApiCall(
            "GET",
            this.homeserverName,
            "/_matrix/media/r0/preview_url",
            {access_token: this.accessToken, url: url}
        ).then(response => {
            return response;
        });
    }
}
