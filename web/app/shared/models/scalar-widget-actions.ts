export interface ScalarToWidgetRequest {
    api: "to_widget";
    action: "supported_api_versions" | "screenshot" | "capabilities" | "send_event" | "visibility_change" | string;
    requestId: string;
    widgetId: string;
    data?: any;
}