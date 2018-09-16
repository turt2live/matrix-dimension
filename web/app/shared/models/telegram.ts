export interface FE_TelegramBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    allowPuppets?: boolean;
    sharedSecret?: string;
    isEnabled: boolean;
}