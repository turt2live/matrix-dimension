import { doFederatedApiCall } from "./helpers";
import AppService from "../db/models/AppService";

export interface MatrixUserResponse {
    access_token: string;
    device_id: string;
    home_server: string;
    user_id: string;
}

export class MatrixAppserviceClient {

    constructor(private homeserverName: string, private appservice: AppService) {
    }

    public async registerUser(localpart: string): Promise<MatrixUserResponse> {
        return doFederatedApiCall(
            "POST",
            this.homeserverName,
            "/_matrix/client/r0/register",
            {access_token: this.appservice.asToken},
            {type: "m.login.application_service", username: localpart},
        );
    }

    public async whoAmI(): Promise<string> {
        const response = await doFederatedApiCall(
            "GET",
            this.homeserverName,
            "/_matrix/client/r0/account/whoami",
            {access_token: this.appservice.asToken},
        );
        return response['user_id'];
    }
}
