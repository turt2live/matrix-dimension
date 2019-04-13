export interface FE_IrcBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    isEnabled: boolean;
    isOnline: boolean;
    availableNetworks: FE_IrcBridgeAvailableNetworks;
}

export interface FE_IrcBridgeAvailableNetworks {
    [networkId: string]: {
        name: string;
        domain: string;
        bridgeUserId: string;
        isEnabled: boolean;
    };
}