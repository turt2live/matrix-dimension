export interface QueryNetworksResponse {
    servers: {
        network_id: string;
        bot_user_id: string;
        desc: string;
        fields: {
            domain: string;
        };
    }[];
}