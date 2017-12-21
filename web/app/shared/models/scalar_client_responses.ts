export interface ScalarResponse {
    action: string;
}

export interface ScalarRoomResponse extends ScalarResponse {
    room_id: string;
}

export interface ScalarUserResponse extends ScalarRoomResponse {
    user_id: string;
}

export interface ScalarErrorResponse extends ScalarResponse {
    response: { error: { message: string, _error: Error } };
}

export interface ScalarSuccessResponse extends ScalarResponse {
    response: { success: boolean };
}

export interface MembershipStateResponse extends ScalarUserResponse {
    response: {
        membership: string;
        avatar_url: string;
        displayname: string;
    };
}

export interface JoinRuleStateResponse extends ScalarRoomResponse {
    response: {
        join_rule: string;
    };
}

export interface WidgetsResponse extends ScalarRoomResponse {
    response: {
        type: "im.vector.modular.widgets";
        state_key: string;
        sender: string;
        room_id: string;
        content: {
            type: string;
            url: string;
            name?: string;
            data?: any;
        }
    }[];
}

export interface CanSendEventResponse extends ScalarRoomResponse {
    event_type: string;
    is_state: boolean;
    response: boolean;
}

export interface RoomEncryptionStatusResponse extends ScalarRoomResponse {
    response: boolean;
}