import { doFederatedApiCall } from "./helpers";
import { OpenId } from "../models/OpenId";

export class MatrixOpenIdClient {

    constructor(private openId: OpenId) {
    }

    public getUserId(): Promise<string> {
        return doFederatedApiCall(
            "GET",
            this.openId.matrix_server_name,
            "/_matrix/federation/v1/openid/userinfo",
            {access_token: this.openId.access_token}
        ).then(response => {
            return response['sub'];
        });
    }
}
