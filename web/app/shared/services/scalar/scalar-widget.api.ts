import { ScalarToWidgetRequest } from "../../models/scalar-widget-actions";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Subject } from "rxjs/Subject";

export class ScalarWidgetApi {

    public static requestReceived: Subject<ScalarToWidgetRequest> = new ReplaySubject();
    private static widgetId: string;

    private constructor() {
    }

    public static setWidgetId(id: string) {
        ScalarWidgetApi.widgetId = id;
    }

    public static test() {
        ScalarWidgetApi.callAction(null, null);
    }

    public static replyScreenshot(request: ScalarToWidgetRequest, data: Blob): void {
        ScalarWidgetApi.replyEvent(request, {screenshot: data});
    }

    public static replySupportedVersions(request: ScalarToWidgetRequest, versions: string[]): void {
        ScalarWidgetApi.replyEvent(request, {supported_versions: versions});
    }

    public static replyCapabilities(request: ScalarToWidgetRequest,
                                    capabilities: (
                                        "m.text" | "m.image" | "m.sticker" | "m.capability.screenshot" | "m.capability.request_data" |
                                        "m.capability.request_messages" | "m.capability.room_membership" | string)[]
    ): void {
        ScalarWidgetApi.replyEvent(request, {capabilities: capabilities});
    }

    public static replyError(request: ScalarToWidgetRequest, error: Error, message: string = null): void {
        ScalarWidgetApi.replyEvent(request, {error: {message: message || error.message, error: error}});
    }

    private static callAction(action, payload) {
        if (!window.opener) {
            return;
        }

        let request = JSON.parse(JSON.stringify(payload));
        request["api"] = "fromWidget";
        request["widgetId"] = ScalarWidgetApi.widgetId;
        request["action"] = action;

        window.opener.postMessage(request, "*");
    }

    private static replyEvent(request: ScalarToWidgetRequest, payload) {
        if (!window.opener) {
            return;
        }

        let response = JSON.parse(JSON.stringify(payload));
        let requestClone = JSON.parse(JSON.stringify(request));
        requestClone["response"] = response;
        window.opener.postMessage(requestClone, "*");
    }
}

// Register the event listener here to ensure it gets created
window.addEventListener("message", event => {
    if (!event.data) return;

    if (event.data.api === "toWidget" && event.data.action) {
        ScalarWidgetApi.requestReceived.next(event.data);
        return;
    }
});
