import { GET, Path, QueryParam } from "typescript-rest";
import * as request from "request";
import { LogService } from "matrix-js-snippets";
import { URL } from "url";
import { BigBlueButtonJoinRequest } from "../../models/Widget";
import { BigBlueButtonJoinResponse, BigBlueButtonCreateAndJoinMeetingResponse, BigBlueButtonWidgetResponse } from "../../models/WidgetResponses";
import { AutoWired } from "typescript-ioc/es6";
import { ApiError } from "../ApiError";
import { sha256 } from "../../utils/hashing";
import config from "../../config";
import { parseStringPromise } from "xml2js";
import * as randomString from "random-string";

/**
 * API for the BigBlueButton widget.
 */
@Path("/api/v1/dimension/bigbluebutton")
@AutoWired
export class DimensionBigBlueButtonService {

    /**
     * A regex used for extracting the authenticity token from the HTML of a
     * greenlight server response
     */
    private authenticityTokenRegexp = new RegExp(`name="authenticity_token" value="([^"]+)".*`);

    // join handles the request from a client to join a BigBlueButton meeting
    // via a Greenlight URL. Note that this is no longer the only way to join a
    // BigBlueButton meeting. See xxx below for the API that bypasses Greenlight
    // and instead calls the BigBlueButton API directly.
    //
    // The client is expected to send a link created by greenlight, the nice UI
    // that's recommended to be installed on top of BBB, which is itself a BBB
    // client.
    //
    // This greenlight link is nice, but greenlight unfortunately doesn't have any
    // API, and no simple way for us to translate a link from it into a BBB meeting
    // URL. It's intended to be loaded by browsers. You enter your preferred name,
    // click submit, you potentially wait for the meeting to start, and then you
    // finally get the link to join the meeting, and you load that.
    //
    // As there's no other way to do it, we just reverse-engineer it and pretend
    // to be a browser below. We can't do this from the client side as widgets
    // run in iframes and browsers can't inspect the content of an iframe if
    // it's running on a separate domain.
    //
    // So the client gets a greenlight URL pasted into it. The flow is then:
    //
    //
    // +---------+                                                                   +-----------+                                                                           +-------------+ +-----+
    // | Client  |                                                                   | Dimension |                                                                           | Greenlight  | | BBB |
    // +---------+                                                                   +-----------+                                                                           +-------------+ +-----+
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      | /bigbluebutton/join&greenlightUrl=https://.../abc-def-123&fullName=bob      |                                                                                       |           |
    //      |---------------------------------------------------------------------------->|                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             | GET https://.../abc-def-123                                                           |           |
    //      |                                                                             |-------------------------------------------------------------------------------------->|           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                                                        Have some HTML |           |
    //      |                                                                             |<--------------------------------------------------------------------------------------|           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             | Extract authenticity_token from HTML                                                  |           |
    //      |                                                                             |-------------------------------------                                                  |           |
    //      |                                                                             |                                    |                                                  |           |
    //      |                                                                             |<------------------------------------                                                  |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             | Extract cookies from HTTP response                                                    |           |
    //      |                                                                             |-----------------------------------                                                    |           |
    //      |                                                                             |                                  |                                                    |           |
    //      |                                                                             |<----------------------------------                                                    |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             | POST https://.../abc-def-123&authenticity_token=...&abc-def-123[join_name]=bob        |           |
    //      |                                                                             |-------------------------------------------------------------------------------------->|           |
    //      |===============================================================================================If the meeting has not started yet================================================|
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                      HTML https://.../abc-def-123 Meeting not started |           |
    //      |                                                                             |<--------------------------------------------------------------------------------------|           |
    //      |                                                                             |                                                                                       |           |
    //      |                        400 MEETING_NOT_STARTED_YET                          |                                                                                       |           |
    //      |<----------------------------------------------------------------------------|                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      | Wait a bit and restart the process                                          |                                                                                       |           |
    //      |-------------------------------------                                        |                                                                                       |           |
    //      |                                    |                                        |                                                                                       |           |
    //      |<------------------------------------                                        |                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      |=================================================================================================================================================================================|
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                                        302 Location: https://bbb.example.com/join?... |           |
    //      |                                                                             |<--------------------------------------------------------------------------------------|           |
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             | Extract value of Location header                                                      |           |
    //      |                                                                             |---------------------------------                                                      |           |
    //      |                                                                             |                                |                                                      |           |
    //      |                                                                             |<--------------------------------                                                      |           |
    //      |                                                                             |                                                                                       |           |
    //      |                                            https://bbb.example.com/join?... |                                                                                       |           |
    //      |<----------------------------------------------------------------------------|                                                                                       |           |
    //      |                                                                             |                                                                                       |           |
    //      | GET https://bbb.example.com/join?...                                        |                                                                                       |           |
    //      |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------->|
    //      |                                                                             |                                                                                       |           |
    //      |                                                                             |                              Send back meeting page HTML                              |           |
    //      |<--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    //
    @GET
    @Path("join")
    public async join(
        joinRequest: BigBlueButtonJoinRequest,
        @QueryParam("greenlightUrl") greenlightURL: string,
        @QueryParam("fullName") fullName: string,
    ): Promise<BigBlueButtonJoinResponse|ApiError> {
        // Parse the greenlight url and retrieve the path
        const greenlightMeetingID = new URL(greenlightURL).pathname;

        LogService.info("BigBlueButton", "URL from client: " + greenlightURL);
        LogService.info("BigBlueButton", "MeetingID: " + greenlightMeetingID);
        LogService.info("BigBlueButton", "Name given from client: " + fullName);
        LogService.info("BigBlueButton", joinRequest);

        // Query the URL the user has given us
        let response = await this.doRequest("GET", greenlightURL);
        if (!response || !response.body) {
            throw new Error("Invalid response from Greenlight server while joining meeting");
        }

        // Attempt to extract the authenticity token
        const matches = response.body.match(this.authenticityTokenRegexp);
        if (matches.length < 2) {
            throw new Error("Unable to find authenticity token for given 'greenlightUrl' parameter");
        }
        const authenticityToken = matches[1];

        // Give the authenticity token and desired name to greenlight, getting the
        // join URL in return. Greenlight will send the URL back as a Location:
        // header. We want to extract and return the contents of this header, rather
        // than following it ourselves

        // Add authenticity token and full name to the query parameters
        let queryParams = {authenticity_token: authenticityToken};
        queryParams[`${greenlightMeetingID}[join_name]`] = fullName;

        // Request the updated URL
        response = await this.doRequest("POST", greenlightURL, queryParams, "{}", false);
        if (!response || !response.body) {
            throw new Error("Invalid response from Greenlight server while joining meeting");
        }

        if (!("location" in response.response.headers)) {
            // We didn't get a meeting URL back. This could either happen due to an issue with the parameters
            // sent to the server... or the meeting simply hasn't started yet.

            // Assume it hasn't started yet. Send a custom error code back to the client informing them to try
            // again in a bit
            return new ApiError(
                400,
                {error: "Unable to find meeting URL in greenlight response"},
                "WAITING_FOR_MEETING_START",
            );
        }

        // Return the join URL for the client to load
        const joinUrl = response.response.headers["location"];
        LogService.info("BigBlueButton", "Sending back join URL: " + joinUrl)
        return {url: joinUrl};
    }

    /**
     * Clients can call this endpoint in order to retrieve the contents of the widget room state.
     * This endpoint will create a BigBlueButton meeting and place the returned ID and password in the room state.
     * @param {string} roomId The ID of the room that the widget will live in.
     */
    @GET
    @Path("widget_state")
    public async widget(
        @QueryParam("roomId") roomId: string,
    ): Promise<BigBlueButtonWidgetResponse|ApiError> {
        // Hash the room ID in order to generate a unique widget ID
        const widgetId = sha256(roomId + "bigbluebutton");

        const widgetName = config.bigbluebutton.widgetName;
        const widgetTitle = config.bigbluebutton.widgetTitle;
        const widgetAvatarUrl = config.bigbluebutton.widgetAvatarUrl;

        LogService.info("BigBlueButton", "Got a meeting create request for room: " + roomId);

        // NOTE: BBB meetings will by default end a minute or two after the last person leaves.
        const createQueryParameters = {
            meetingID: randomString(20),
            // To help admins link meeting IDs to rooms
            meta_MatrixRoomID: roomId,
        };

        // Create a new meeting.
        const createResponse = await this.makeBBBApiCall("GET", "create", createQueryParameters, null);
        LogService.info("BigBlueButton", createResponse);

        // The password users will join with.
        // TODO: We could give users access to moderate the meeting if we returned createResponse.moderatorPW, but it's
        // unclear how we pass this to the user without also leaking it to others in the room.
        // We could have the client request the password and depending on their power level in the room, return either
        // the attendee or moderator one.
        const attendeePassword = createResponse.attendeePW[0];

        // TODO: How do we get the user dimension is actually running as?
        const widgetCreatorUserId = "@dimension:" + config.homeserver.name;

        // Add all necessary client variables to the url when loading the widget
        const widgetUrl = config.dimension.publicUrl +
            "/widgets/bigbluebutton" +
            "?widgetId=$matrix_widget_id" +
            "&roomId=$matrix_room_id" +
            "&createMeeting=true" +
            "&displayName=$matrix_display_name" +
            "&avatarUrl=$matrix_avatar_url" +
            "&userId=$matrix_user_id" +
            `&meetingId=${createResponse.meetingID[0]}` +
            `&meetingPassword=${attendeePassword}` +
            "&auth=$openidtoken-jwt";

        return {
            "widget_id": widgetId,
            "widget": {
                "creatorUserId": widgetCreatorUserId,
                "id": widgetId,
                "type": "m.custom",
                "waitForIframeLoad": true,
                "name": widgetName,
                "avatar_url": widgetAvatarUrl,
                "url": widgetUrl,
                "data": {
                    "title": widgetTitle,
                }
            },
            "layout": {
            "container": "top",
                "index": 0,
                "width": 65,
                "height": 50,
            }
        }
    }

    /**
     * Clients can call this endpoint in order to retrieve a URL that leads to the BigBlueButton API that they can
     * use to join the meeting with. They will need to provide the meeting ID and password which are only available
     * from the widget room state event.
     * @param {string} displayName The displayname of the user.
     * @param {string} userId The Matrix User ID of the user.
     * @param {string} avatarUrl The avatar of the user (mxc://...).
     * @param {string} meetingId The meeting ID to join.
     * @param {string} password The password to attempt to join the meeting with.
     */
    @GET
    @Path("getJoinUrl")
    public async createAndJoinMeeting(
        @QueryParam("displayName") displayName: string,
        @QueryParam("userId") userId: string,
        @QueryParam("avatarUrl") avatarUrl: string,
        @QueryParam("meetingId") meetingId: string,
        @QueryParam("meetingPassword") password: string,
    ): Promise<BigBlueButtonCreateAndJoinMeetingResponse|ApiError> {
        // Check if the meeting exists and is running. If not, return an error for each case
        let getMeetingInfoParameters = {
            meetingID: meetingId,
        }

        const getMeetingInfoResponse = await this.makeBBBApiCall("GET", "getMeetingInfo", getMeetingInfoParameters, null);
        LogService.info("BigBlueButton", getMeetingInfoResponse)
        if (getMeetingInfoResponse.returncode[0] === "FAILED") {
            // This meeting does not exist, inform the user
            return new ApiError(
                400,
                {error: "This meeting does not exist."},
                "UNKNOWN_MEETING_ID",
            );
        } else if (getMeetingInfoResponse.running[0] === "false" && getMeetingInfoResponse.endTime[0] !== "0") {
            // This meeting did exist, but has ended. Inform the user
            return new ApiError(
                400,
                {error: "This meeting has ended."},
                "MEETING_HAS_ENDED",
            );
        }

        let joinQueryParameters = {
            meetingID: meetingId,
            password: password,
            fullName: `${displayName} (${userId})`,
            userID: userId,
        }

        // Add an avatar to the join request if the user provided one
        if (avatarUrl.startsWith("mxc")) {
            joinQueryParameters["avatarURL"] = this.getHTTPAvatarUrlFromMXCUrl(avatarUrl);
        }

        // Calculate the checksum for the join URL. We need to do so as a browser would as we're passing this back to a browser
        const checksum = this.bbbChecksumFromCallNameAndQueryParamaters("join", joinQueryParameters, true);

        // Construct the join URL, which we'll give back to the client, who can then add additional parameters to (or we just do it)
        const url = `${config.bigbluebutton.apiBaseUrl}/join?${this.queryStringFromObject(joinQueryParameters, true)}&checksum=${checksum}`;

        return {
            url: url,
        };
    }

    /**
     * Make an API call to the configured BBB server instance.
     * @param {string} method The HTTP method to use for the request.
     * @param {string} apiCallName The name of the API (the last bit of the endpoint) to call. e.g 'create', 'join'.
     * @param {any} queryParameters The query parameters to use in the request.
     * @param {any} body The body of the request.
     * @returns {any} The response to the call.
     */
    private async makeBBBApiCall(
        method: string,
        apiCallName: string,
        queryParameters: any,
        body: any,
    ): Promise<any> {
        // Compute the checksum needed to authenticate the request (as derived from the configured shared secret)
        queryParameters.checksum = this.bbbChecksumFromCallNameAndQueryParamaters(apiCallName, queryParameters, false);

        // Get the URL host and path using the configured api base and the API call name
        const url = `${config.bigbluebutton.apiBaseUrl}/${apiCallName}`;

        // Now make the request!
        const response = await this.doRequest(method, url, queryParameters, body);

        // Parse and return the XML from the response
        // TODO: XML parsing error handling
        const parsedResponse = await parseStringPromise(response.body);

        // Extract the "response" object
        return parsedResponse.response;
    }

    /**
     * Converts an object representing a query string into a checksum suitable for appending to a BBB API call.
     * Docs: https://docs.bigbluebutton.org/dev/api.html#usage
     * @param {string} apiCallName The name of the API to call, e.g "create", "join".
     * @param {any} queryParameters An object representing a set of query parameters represented by keys and values.
     * @param {boolean} encodeAsBrowser Whether to encode the query string as a browser would.
     * @returns {string} The checksum for the request.
     */
    private bbbChecksumFromCallNameAndQueryParamaters(apiCallName: string, queryParameters: any, encodeAsBrowser: boolean): string {
        // Convert the query parameters object into a string
        // We URL encode each value as a browser would. If we don't, our resulting checksum will not match.
        const widgetQueryString = this.queryStringFromObject(queryParameters, encodeAsBrowser);

        LogService.info("BigBlueButton", "Built widget string:" + widgetQueryString);
        LogService.info("BigBlueButton", "Hashing:" + apiCallName + widgetQueryString + config.bigbluebutton.sharedSecret);

        // Hash the api name and query parameters to get the checksum, and add it to the set of query parameters
        return sha256(apiCallName + widgetQueryString + config.bigbluebutton.sharedSecret);
    }

    /**
     * Converts an object containing keys and values as strings into a string representing URL query parameters.
     * @param queryParameters
     * @param encodeAsBrowser
     * @returns {string} The query parameter object as a string.
     */
    private queryStringFromObject(queryParameters: any, encodeAsBrowser: boolean): string {
        return Object.keys(queryParameters).map(k => k + "=" + this.encodeForUrl(queryParameters[k], encodeAsBrowser)).join("&");
    }

    /**
     * Encodes a string in the same fashion browsers do (encoding ! and other characters).
     * @param {string} text The text to encode.
     * @param {boolean} encodeAsBrowser Whether to encode the query string as a browser would.
     * @returns {string} The encoded text.
     */
    private encodeForUrl(text: string, encodeAsBrowser: boolean): string {
        let encodedText = encodeURIComponent(text);
        if (!encodeAsBrowser) {
            // use + instead of %20 for space to match what the 'request' JavaScript library does do.
            // encodeURIComponent doesn't escape !'()*, so manually escape them.
            encodedText = encodedText.replace(/%20/g, '+').replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
        }

        return encodedText;
    }

    /**
     * Perform an HTTP request.
     * @param {string} method The HTTP method to use.
     * @param {string} url The URL (without query parameters) to request.
     * @param {string} qs The query parameters to use with the request.
     * @param {string} body The JSON body of the request
     * @param {boolean} followRedirect Whether to follow redirect responses automatically.
     */
    private async doRequest(
        method: string,
        url: string,
        qs?: any,
        body?: any,
        followRedirect = true,
    ): Promise<any> {
        // Query a URL, expecting an HTML response in return
        return new Promise((resolve, reject) => {
            request({
                method: method,
                url: url,
                qs: qs,
                body: body,
                followRedirect: followRedirect,
                jar: true, // remember cookies between requests
                json: false, // expect html

            }, (err, res, _body) => {
                try {
                    if (err) {
                        LogService.error("BigBlueButtonWidget", "Error calling " + url);
                        LogService.error("BigBlueButtonWidget", err);
                        reject(err);
                    } else if (!res) {
                        LogService.error("BigBlueButtonWidget", "There is no response for " + url);
                        reject(new Error("No response provided - is the service online?"));
                    } else if (res.statusCode !== 200 && res.statusCode !== 302) {
                        LogService.error("BigBlueButtonWidget", "Got status code " + res.statusCode + " when calling " + url);
                        LogService.error("BigBlueButtonWidget", res.body);
                        reject({body: res.body, status: res.statusCode});
                    } else {
                        resolve({body: res.body, response: res});
                    }
                } catch (e) {
                    LogService.error("BigBlueButtonWidget", e);
                    reject(e);
                }
            });
        });
    }

    private getHTTPAvatarUrlFromMXCUrl(mxc: string): string {
        const width = 64;
        const height = 64;
        const method = "scale";

        mxc = mxc.substring("mxc://".length).split('?')[0];
        return `${config.dimension.publicUrl}/api/v1/dimension/media/thumbnail/${mxc}?width=${width}&height=${height}&method=${method}&animated=false`;
    }

}
