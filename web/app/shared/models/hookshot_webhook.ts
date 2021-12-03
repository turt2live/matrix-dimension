export interface FE_HookshotWebhookBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
}

export interface FE_HookshotWebhookConnection {
    id: string;
    config: {
        name?: string; // TODO: Update according to bridge support
        url: string;
    };
}
