export interface PortalInformationResponse {
    mxid: string;
    chat_id: number;
    peer_type: string;
    megagroup: boolean;
    username: string;
    title: string;
    about: string;
    can_unbridge: boolean;
}

export interface UserInformationResponse {
    mxid: string;
    permissions: string;
    telegram?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        phone: number;
        is_bot: boolean;
    };
}

export interface UserChatResponse {
    id: number;
    title: string;
}

export interface BridgeInfoResponse {
    relaybot_username: string;
}