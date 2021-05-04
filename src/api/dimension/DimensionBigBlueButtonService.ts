import { GET, Path, QueryParam } from "typescript-rest";
import * as request from "request";
import { LogService } from "matrix-js-snippets";
import { URL } from "url";
import { BigBlueButtonJoinRequest, BigBlueButtonCreateAndJoinMeetingRequest } from "../../models/Widget";
import { BigBlueButtonJoinResponse, BigBlueButtonCreateAndJoinMeetingResponse, BigBlueButtonWidgetResponse } from "../../models/WidgetResponses";
import { AutoWired } from "typescript-ioc/es6";
import { ApiError } from "../ApiError";
import { sha1, sha256 } from "../../utils/hashing";
import config from "../../config";
import { parseStringPromise } from "xml2js";

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
     * Perform an HTTP request.
     * @param {string} method The HTTP method to use.
     * @param {string} url The URL (without query parameters) to request.
     * @param {string} qs The query parameters to use with the request.
     * @param {string} body The JSON body of the request
     * @param {boolean} followRedirect Whether to follow redirect responses automatically.
     * @private
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

    @GET
    @Path("widget_state")
    public async widget(
        @QueryParam("room_id") roomId: string,
    ): Promise<BigBlueButtonWidgetResponse|ApiError> {
        // Hash the room ID in order to generate a unique widget ID
        const widgetId = sha256(roomId + "bigbluebutton");

        // TODO: Make configurable
        const widgetTitle = "BigBlueButton Video Conference";
        const widgetSubTitle = "Join the conference";
        const widgetAvatarUrl = "mxc://fosdem.org/0eea5cb67fbe964399060b10b09a22e45e2226ee";

        // TODO: What should we put for the creatorUserId? Also make it configurable?
        const widgetCreatorUserId = "@bobbb:localhost";

        // TODO: Set to configured Dimension publicUrl
        let widgetUrl = "http://localhost:8082/widgets/bigbluebutton";

        // Add all necessary client variables to the url when loading the widget
        widgetUrl += "?widgetId=$matrix_widget_id&roomId=$matrix_room_id#displayName=$matrix_display_name&avatarUrl=$matrix_avatar_url&userId=$matrix_user_id&roomId=$matrix_room_id&auth=openidtoken-jwt";

        return {
            "widget_id": widgetId,
            "widget": {
                "creatorUserId": widgetCreatorUserId,
                "id": widgetId,
                "type": "m.custom",
                "waitForIframeLoad": true,
                "name": widgetTitle,
                "avatar_url": widgetAvatarUrl,
                "url": widgetUrl,
                "data": {
                    "title": widgetSubTitle,
                    "widgetVersion": 2,
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

    @GET
    @Path("createAndJoinMeeting")
    public async createAndJoinMeeting(
        @QueryParam("room_id") roomId: string,
    ): Promise<BigBlueButtonCreateAndJoinMeetingResponse|ApiError> {
        // Check if a meeting already exists for this room...
        LogService.info("BigBlueButton", "Got a meeting create and join request for room: " + roomId);

        // Create a new meeting
        LogService.info("BigBlueButton", "Using secret: " + config.bigbluebutton.sharedSecret);

        // NOTE: BBB meetings will by default end a minute or two after the last person leaves.
        const queryParameters = {
            meetingID: roomId + "bigbluebuttondimension",
        };
        const response = await this.makeBBBApiCall("GET", "create", queryParameters, null);
        LogService.info("BigBlueButton", response);

        return {
            url: "https://bla.com",
        }
    }

    /**
     * Make an API call to the configured BBB server instance
     * @param {string} method The HTTP method to use for the request.
     * @param {string} apiCallName The name of the API (the last bit of the endpoint) to call. e.g 'create', 'join'.
     * @param {any} queryParameters The query parameters to use in the request.
     * @param {any} body The body of the request.
     * @private
     * @returns {BigBlueButtonApiResponse} The response to the call.
     */
    private async makeBBBApiCall(
        method: string,
        apiCallName: string,
        queryParameters: any,
        body: any,
    ): Promise<any> {
        // Build the URL path from the api name, query parameter string, shared secret and checksum
        // Docs: https://docs.bigbluebutton.org/dev/api.html#usage

        LogService.info("BigBlueButton", "given query params: " + queryParameters.meetingID);
        // Convert the query parameters map into a string
        // We URL encode each value, as doRequest does so as well. If we don't, our resulting checksum will not match
        const widgetQueryString = Object.keys(queryParameters).map(k => k + "=" + this.encodeForUrl(queryParameters[k])).join("&");
        LogService.info("BigBlueButton", "queryString: " + widgetQueryString);

        // SHA1 hash the api name and query parameters to get the checksum, and add it to the set of query parameters
        queryParameters.checksum = sha1(apiCallName + widgetQueryString + config.bigbluebutton.sharedSecret);
        LogService.info("BigBlueButton", "hashing: " + apiCallName + widgetQueryString + config.bigbluebutton.sharedSecret);

        // Get the URL host and path using the configured api base and the API call name
        const url = `${config.bigbluebutton.apiBaseUrl}/${apiCallName}`;
        const qsWithChecksum = Object.keys(queryParameters).map(k => k + "=" + this.encodeForUrl(queryParameters[k])).join("&");
        LogService.info("BigBlueButton", "final url: " + url + "?" + qsWithChecksum);

        // Now make the request!
        // TODO: Unfortunately doRequest is URLencoding the query parameters which the checksum stuff doesn't take into account.
        // So we need to disable URL encoding here, or do it when calculating the checksum
        const response = await this.doRequest(method, url, queryParameters, body);

        // Parse and return the XML from the response
        LogService.info("BigBlueButton", response.body);
        return await parseStringPromise(response.body);
    }

    /**
     * Encodes a string in the same fashion browsers do (encoding ! and other characters)
     * @param {string} text The text to encode
     */
    encodeForUrl(text: string) {
        // use + instead of %20 for space to match what the Java tools do.
        // encodeURIComponent doesn't escape !'()* but browsers do, so manually escape them.
        return encodeURIComponent(text).replace(/%20/g, '+').replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
    }

}
