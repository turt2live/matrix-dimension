import { GET, Path, QueryParam } from "typescript-rest";
import * as request from "request";
import { LogService } from "matrix-js-snippets";
import { URL } from "url";
import { BigBlueButtonJoinRequest } from "../../models/Widget";
import { BigBlueButtonJoinResponse } from "../../models/WidgetResponses";
import { AutoWired } from "typescript-ioc/es6";
import { ApiError } from "../ApiError";

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

    private async doRequest(
        method: string,
        url: string,
        qs?: any,
        body?: any,
        followRedirect: boolean = true,
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

}
