export interface ModularIntegrationInfoResponse {
    bot_user_id: string;
    integrations?: any[];
}

export interface ModularIrcResponse<T> {
    replies: {
        rid: string;
        response: T;
    }[];
}

export interface ModularGitterResponse<T> {
    replies: {
        rid: string;
        response: T;
    }[];
}

export interface ModularSlackResponse<T> {
    replies: {
        rid: string;
        response: T;
    }[];
}