export interface FE_WebhooksBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
}

export interface FE_Webhook {
    id: string;
    label: string;
    url: string;
    userId: string;
    roomId: string;
    type: "incoming";
}

export interface FE_WebhookOptions {
    label: string;
}