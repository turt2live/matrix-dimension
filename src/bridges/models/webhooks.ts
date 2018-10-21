export interface WebhookConfiguration {
    id: string;
    label: string;
    url: string;
    userId: string;
    roomId: string;
    type: "incoming";
}

export interface ListWebhooksResponse extends SuccessResponse {
    results: WebhookConfiguration[];
}

export interface WebhookResponse extends WebhookConfiguration, SuccessResponse {
}

export interface WebhookOptions {
    label: string;
}

export interface SuccessResponse {
    success: boolean;
}

export interface WebhookBridgeInfo {
    botUserId: string;
}