export interface BigBlueButtonGetJoinUrlRequest {
    // The display name of the user attempting to join the meeting.
    // Will be combined with userId and passed to BigBlueButton.
    displayName: string;
    // The user ID of the user attempting to join the meeting.
    // Will be combined with displayName and passed to BigBlueButton.
    userId: string;
    // Optional. The avatar of the user attempting to join the meeting.
    // Will be passed to BigBlueButton.
    avatarUrl: string;
    // The ID of the meeting to join.
    meetingId: string;
    // The password to join the meeting with.
    meetingPassword: string;
}
