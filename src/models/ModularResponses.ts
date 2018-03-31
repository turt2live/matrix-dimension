import { QueryNetworksResponse } from "../bridges/models/provision_responses";

export interface ModularIntegrationInfoResponse {
    bot_user_id: string;
    integrations?: any[];
}

export interface ModularIrcQueryNetworksResponse {
    replies: {
        rid: string;
        response: QueryNetworksResponse;
    }[];
}