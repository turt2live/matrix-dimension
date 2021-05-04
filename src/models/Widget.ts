export interface BigBlueButtonJoinRequest {
    // A URL supplied by greenlight, BigBlueButton's nice UI project that is itself
    // a BigBlueButton client
    greenlightUrl: string;
    // The name the user wishes to join the meeting with
    fullName: string;
}

export interface BigBlueButtonCreateAndJoinMeetingRequest {
    // The ID of the room that the BBB meeting is a part of
    roomId: string;
    // The name the user wishes to join the meeting with
    fullName: string;
}
