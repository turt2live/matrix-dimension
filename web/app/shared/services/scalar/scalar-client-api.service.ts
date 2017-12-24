import { Injectable } from "@angular/core";
import * as randomString from "random-string";
import {
    CanSendEventResponse,
    JoinRuleStateResponse,
    MembershipStateResponse, RoomEncryptionStatusResponse,
    ScalarSuccessResponse,
    WidgetsResponse
} from "../../models/scalar_client_responses";
import { EditableWidget } from "../../models/widget";

@Injectable()
export class ScalarClientApiService {

    private static actionMap: { [key: string]: { resolve: (obj: any) => void, reject: (obj: any) => void } } = {};

    public static getAndRemoveActionHandler(requestKey: string): { resolve: (obj: any) => void, reject: (obj: any) => void } {
        let handler = ScalarClientApiService.actionMap[requestKey];
        ScalarClientApiService.actionMap[requestKey] = null;
        return handler;
    }

    constructor() {
    }

    public inviteUser(roomId: string, userId): Promise<ScalarSuccessResponse> {
        return this.callAction("invite", {
            room_id: roomId,
            user_id: userId
        });
    }

    public getMembershipState(roomId: string, userId: string): Promise<MembershipStateResponse> {
        return this.callAction("membership_state", {
            room_id: roomId,
            user_id: userId
        });
    }

    public getJoinRule(roomId: string): Promise<JoinRuleStateResponse> {
        return this.callAction("join_rules_state", {
            room_id: roomId
        });
    }

    public getWidgets(roomId: string): Promise<WidgetsResponse> {
        return this.callAction("get_widgets", {
            room_id: roomId
        });
    }

    public setWidget(roomId: string, widget: EditableWidget): Promise<ScalarSuccessResponse> {
        return this.callAction("set_widget", {
            room_id: roomId,
            widget_id: widget.id,
            type: widget.type,
            url: widget.url,
            name: widget.name,
            data: widget.data
        });
    }

    public deleteWidget(roomId: string, widget: EditableWidget): Promise<ScalarSuccessResponse> {
        return this.callAction("set_widget", {
            room_id: roomId,
            widget_id: widget.id,
            type: widget.type, // required for some reason
            url: ""
        });
    }

    public close(): void {
        this.callAction("close_scalar", {});
    }

    public canSendEvent(roomId: string, eventType: string, isState: boolean): Promise<CanSendEventResponse> {
        return this.callAction("can_send_event", {
            room_id: roomId,
            event_type: eventType,
            is_state: isState,
        });
    }

    public isRoomEncrypted(roomId: string): Promise<RoomEncryptionStatusResponse> {
        return this.callAction("get_room_enc_state", {
            room_id: roomId,
        });
    }

    private callAction(action, payload): Promise<any> {
        let requestKey = randomString({length: 20});
        return new Promise((resolve, reject) => {
            if (!window.opener) {
                // Mimic an error response from scalar
                reject({response: {error: {message: "No window.opener", _error: new Error("No window.opener")}}});
                return;
            }

            ScalarClientApiService.actionMap[requestKey] = {
                resolve: resolve,
                reject: reject
            };

            let request = JSON.parse(JSON.stringify(payload));
            request["request_id"] = requestKey;
            request["action"] = action;

            window.opener.postMessage(request, "*");
        });
    }
}

// Register the event listener here to ensure it gets created
window.addEventListener("message", event => {
    if (!event.data) return;

    let requestKey = event.data["request_id"];
    if (!requestKey) return;

    let action = ScalarClientApiService.getAndRemoveActionHandler(requestKey);
    if (!action) return;

    if (event.data.response && event.data.response.error) action.reject(event.data);
    else action.resolve(event.data);
});
