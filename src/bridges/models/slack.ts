export interface GetBotUserIdResponse {
    bot_user_id: string;
}

export interface BridgedChannelResponse {
    matrix_room_id: string;
    auth_url?: string;
    inbound_uri?: string;
    isWebhook: boolean;
    slack_webhook_uri?: string;
    status: "pending" | "ready";
    slack_channel_name?: string;
    team_id?: string;
    slack_channel_id: string;
}

export interface TeamsResponse {
    teams: SlackTeam[];
}

export interface SlackTeam {
    id: string;
    name: string;
    slack_id: string;
}

export interface ChannelsResponse {
    channels: SlackChannel[];
}

export interface SlackChannel {
    id: string;
    name: string;
    purpose: {
        creator: string;
        last_set: number;
        value: string;
    };
    topic: {
        creator: string;
        last_set: number;
        value: string;
    };
}

export interface AuthUrlResponse {
    auth_uri: string;
}