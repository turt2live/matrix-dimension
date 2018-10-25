export interface FE_SlackBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    isEnabled: boolean;
}

export interface FE_SlackLink {
    roomId: string;
    isWebhook: boolean;
    channelName: string;
    channelId: string;
    teamId: string;
}

export interface FE_SlackTeam {
    id: string;
    name: string;
}

export interface FE_SlackChannel {
    id: string;
    name: string;
}