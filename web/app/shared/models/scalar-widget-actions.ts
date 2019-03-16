export interface ScalarToWidgetRequest {
    api: "to_widget";
    action: "supported_api_versions" | "screenshot" | "capabilities" | "send_event" | "visibility" | "openid_credentials" | string;
    requestId: string;
    widgetId: string;
    data?: any;
}

export interface ScalarFromWidgetResponse {
    api: "from_widget";
    action: "get_openid" | string;
    requestId: string;
    widgetId: string;
    data?: any;
    response: any;
}