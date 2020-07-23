export interface BigBlueButtonJoinRequest {
    // A URL supplied by greenlight, BigBlueButton's nice UI project that is itself
    // a BigBlueButton client
    greenlightUrl: string;
    // The name the user wishes to join the meeting with
    fullName: string;
}
