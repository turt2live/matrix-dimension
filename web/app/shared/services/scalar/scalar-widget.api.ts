import { ScalarFromWidgetResponse, ScalarToWidgetRequest } from "../../models/scalar-widget-actions";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Subject } from "rxjs/Subject";
import { FE_Sticker, FE_StickerPack } from "../../models/integration";
import * as randomString from "random-string";

export class ScalarWidgetApi {

    public static requestReceived: Subject<ScalarToWidgetRequest> = new ReplaySubject();
    public static replyReceived: Subject<ScalarFromWidgetResponse> = new ReplaySubject();
    public static widgetId: string;
    public static inFlightRequestIds: string[] = [];

    private constructor() {
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
        ScalarWidgetApi.replyEvent(request, {error: {message: message || error.message, _error: error}});
    }

    public static replyAcknowledge(request: ScalarToWidgetRequest): void {
        ScalarWidgetApi.replyEvent(request, {success: true});
    }

    public static sendSticker(sticker: FE_Sticker, pack: FE_StickerPack): void {
        ScalarWidgetApi.callAction("m.sticker", {
            data: {
                description: sticker.description,
                content: {
                    body: sticker.description,
                    url: sticker.thumbnail.mxc,
                    info: {
                        mimetype: sticker.image.mimetype,
                        w: sticker.thumbnail.width / 2,
                        h: sticker.thumbnail.height / 2,
                        thumbnail_url: sticker.thumbnail.mxc,
                        thumbnail_info: {
                            mimetype: sticker.image.mimetype,
                            w: sticker.thumbnail.width / 2,
                            h: sticker.thumbnail.height / 2,
                        },

                        // This has to be included in the info object so it makes it to the event
                        dimension: {
                            license: pack.license,
                            author: pack.author,
                        },
                    },
                },
            },
        });
    }

    public static sendSetAlwaysOnScreen(alwaysVisible: boolean): void {
        ScalarWidgetApi.callAction("set_always_on_screen", {
            // Send the value here and in data due to a Riot bug.
            data: {
                value: alwaysVisible,
            },
        });
    }

    public static openIntegrationManager(integrationType: string, integrationId: string): void {
        ScalarWidgetApi.callAction("integration_manager_open", {
            data: {
                integType: integrationType,
                integId: integrationId,
            },
        });
    }

    public static requestOpenID(): void {
        ScalarWidgetApi.callAction("get_openid", {});
    }

    public static requestSupportedVersions(): void {
        ScalarWidgetApi.callAction("supported_api_versions", {});
    }

    private static callAction(action, payload) {
        if (!window.opener) {
            return;
        }

        let request = JSON.parse(JSON.stringify(payload));
        request["api"] = "fromWidget";
        request["widgetId"] = ScalarWidgetApi.widgetId;
        request["action"] = action;
        request["requestId"] = randomString({length: 160});

        ScalarWidgetApi.inFlightRequestIds.push(request["requestId"]);

        console.log("[Dimension] Sending fromWidget: ", request);
        window.opener.postMessage(request, "*");
    }

    private static replyEvent(request: ScalarToWidgetRequest, payload) {
        if (!window.opener) {
            return;
        }

        let requestClone = JSON.parse(JSON.stringify(request));
        requestClone["response"] = payload;

        console.log("[Dimension] Sending postMessage response: ", request);
        window.opener.postMessage(requestClone, "*");
    }
}

// Register the event listener here to ensure it gets created
window.addEventListener("message", event => {
    if (!event.data) return;

    if (event.data.api === "toWidget" && event.data.action) {
        if (event.data.widgetId && !ScalarWidgetApi.widgetId) ScalarWidgetApi.widgetId = event.data.widgetId;
        console.log(`[Dimension] Received toWidget request at widget ID ${ScalarWidgetApi.widgetId}: ${JSON.stringify(event.data)}`);
        ScalarWidgetApi.requestReceived.next(event.data);
        return;
    }

    if (event.data.api === "fromWidget" && ScalarWidgetApi.inFlightRequestIds.indexOf(event.data.requestId) !== -1) {
        if (event.data.widgetId && !ScalarWidgetApi.widgetId) ScalarWidgetApi.widgetId = event.data.widgetId;
        console.log(`[Dimension] Received fromWidget response at widget ID ${ScalarWidgetApi.widgetId}: ${JSON.stringify(event.data)}`);

        const idx = ScalarWidgetApi.inFlightRequestIds.indexOf(event.data.requestId);
        ScalarWidgetApi.inFlightRequestIds.splice(idx, 1);
        ScalarWidgetApi.replyReceived.next(event.data);

        return;
    }
});
