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

export interface ListLinksResponseItem {
    matrix_room_id: string;
    remote_room_channel: string;
    remote_room_server: string;
}

export interface ListOpsResponse {
    operators: string[];
}