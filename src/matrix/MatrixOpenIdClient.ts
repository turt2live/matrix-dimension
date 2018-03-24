import { doFederatedApiCall } from "./helpers";
import { OpenId } from "../models/OpenId";

export class MatrixOpenIdClient {

    constructor(private openId: OpenId) {
    }

    public async getUserId(): Promise<string> {
        // TODO: Implement/prefer https://github.com/matrix-org/matrix-doc/issues/1115
        // #1115 also means this should become a client API call, not a federated one (finally)
        const response = await doFederatedApiCall(
            "GET",
            this.openId.matrix_server_name,
            "/_matrix/federation/v1/openid/userinfo",
            {access_token: this.openId.access_token}
        );
        return response['sub'];
    }
}
