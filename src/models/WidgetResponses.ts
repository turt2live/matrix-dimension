export interface BigBlueButtonJoinResponse {
    // The meeting URL the client should load to join the meeting
    url: string;
}

export interface BigBlueButtonWidgetResponse {
    widget_id: string;
    widget: {
        creatorUserId: string;
        id: string;
        type: string;
        waitForIframeLoad: boolean;
        name: string;
        avatar_url: string;
        url: string;
        data: {
            title: string;
        }
    };
    layout: {
        container: string;
        index: number;
        width: number;
        height: number;
    };
}