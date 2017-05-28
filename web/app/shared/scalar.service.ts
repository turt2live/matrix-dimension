import { Injectable } from "@angular/core";
import * as randomString from "random-string";
import { MembershipStateResponse, ScalarSuccessResponse } from "./models/scalar_responses";

@Injectable()
export class ScalarService {

    private static actionMap: {[key: string]: {resolve: (obj: any) => void, reject: (obj: any) => void}} = {};

    public static getAndRemoveActionHandler(requestKey: string): {resolve: (obj: any) => void, reject: (obj: any) => void} {
        let handler = ScalarService.actionMap[requestKey];
        ScalarService.actionMap[requestKey] = null;
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

    public close(): void {
        this.callAction("close_scalar", {});
    }

    private callAction(action, payload) {
        let requestKey = randomString({length: 20});
        return new Promise((resolve, reject) => {
            if (!window.opener) {
                // Mimic an error response from scalar
                reject({response: {error: {message: "No window.opener", _error: new Error("No window.opener")}}});
                return;
            }

            ScalarService.actionMap[requestKey] = {
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

    let action = ScalarService.getAndRemoveActionHandler(requestKey);
    if (!action) return;

    if (event.data.response && event.data.response.error) action.reject(event.data);
    else action.resolve(event.data);
});
