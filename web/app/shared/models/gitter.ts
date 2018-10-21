export interface FE_GitterBridge {
    id: number;
    upstreamId?: number;
    provisionUrl?: string;
    isEnabled: boolean;
}

export interface FE_GitterLink {
    roomId: string;
    gitterRoomName: string;
}