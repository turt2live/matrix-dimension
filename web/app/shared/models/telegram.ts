export interface FE_TelegramBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    sharedSecret?: string;
    isEnabled: boolean;
    options?: FE_TelegramBridgeOptions;
}

export interface FE_PortalInfo {
    bridged: boolean;
    chatId: number;
    roomId: string;
    canUnbridge: boolean;
    chatName: string;
}

export interface FE_TelegramBridgeOptions {
    allowTgPuppets: boolean;
    allowMxPuppets: boolean;
}