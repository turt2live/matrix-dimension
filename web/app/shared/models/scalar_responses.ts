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
    response: {error: {message: string, _error: Error}};
}

export interface ScalarSuccessResponse extends ScalarResponse {
    response: {success: boolean};
}

export interface MembershipStateResponse extends ScalarUserResponse {
    response: {
        membership: string;
        avatar_url: string;
        displayname: string;
    };
}