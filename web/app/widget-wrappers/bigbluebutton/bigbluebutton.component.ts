import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { CapableWidget } from "../capable-widget";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { BigBlueButtonApiService } from "../../shared/services/integrations/bigbluebutton-api.service";
import { FE_BigBlueButtonCreateAndJoinMeeting, FE_BigBlueButtonJoin, } from "../../shared/models/integration";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "my-bigbluebutton-widget-wrapper",
    templateUrl: "bigbluebutton.component.html",
    styleUrls: ["bigbluebutton.component.scss"],
})
export class BigBlueButtonWidgetWrapperComponent
    extends CapableWidget
    implements OnInit, OnDestroy {
    public canEmbed = true;

    /**
   * User metadata passed to us by the client
   */
    private conferenceUrl: string;
    private displayName: string;
    private userId: string;
    private avatarUrl: string;
    private meetingId: string;
    private meetingPassword: string;

    /**
   *
   * The name to join the BigBlueButton meeting with. Made up of metadata the client passes to us.
   */
    private joinName: string;

    /**
   * Whether we expect the meeting to be created on command.
   *
   * True if we'd like the meeting to be created, false if we have a greenlight URL leading to an existing meeting
   * and would like Dimension to translate that to a BigBlueButton meeting URL.
   */
    private createMeeting: boolean;

    /**
   * The ID of the room, required if createMeeting is true.
   */
    private roomId: string;

    /**
   * The poll period in ms while waiting for a meeting to start
   */
    private pollIntervalMillis = 5000;

    /**
   * Subscriber for messages from the client via the postMessage API
   */
    private bigBlueButtonApiSubscription: Subscription;

    /**
   * A status message to display to the user in the widget, typically for loading messages
   */
    public statusMessage: string;

    /**
   * Whether we are currently in a meeting
   */
    private inMeeting = false;

    /**
   * The URL to embed into the iframe
   */
    public embedUrl: SafeUrl = null;

    constructor(
        activatedRoute: ActivatedRoute,
        private bigBlueButtonApi: BigBlueButtonApiService,
        private sanitizer: DomSanitizer,
        public translate: TranslateService
    ) {
        super();
        this.supportsAlwaysOnScreen = true;

        const params: any = activatedRoute.snapshot.queryParams;

        this.roomId = params.roomId;
        this.createMeeting = params.createMeeting;
        this.conferenceUrl = params.conferenceUrl;
        this.displayName = params.displayName;
        this.avatarUrl = params.avatarUrl;
        this.meetingId = params.meetingId;
        this.meetingPassword = params.meetingPassword;
        this.userId = params.userId || params.email; // Element uses `email` when placing a conference call

        // Create a nick to display in the meeting
        this.joinName = `${this.displayName} (${this.userId})`;

        console.log("BigBlueButton: should create meeting: " + this.createMeeting);
        console.log("BigBlueButton: will join as: " + this.joinName);
        console.log("BigBlueButton: got room ID: " + this.roomId);

        // Set the widget ID if we have it
        ScalarWidgetApi.widgetId = params.widgetId;
    }

    public ngOnInit() {
        super.ngOnInit();
    }

    public onIframeLoad() {
        if (this.inMeeting) {
            // The meeting has ended and we've come back full circle
            this.inMeeting = false;
            this.statusMessage = null;
            this.embedUrl = null;

            ScalarWidgetApi.sendSetAlwaysOnScreen(false);
            return;
        }

        // Have a toggle for whether we're in a meeting. We do this as we don't have a method
        // of checking which URL was just loaded in the iframe (due to different origin domains
        // and browser security), so we have to guess that it'll always be the second load (the
        // first being joining the meeting)
        this.inMeeting = true;

        // We've successfully joined the meeting
        ScalarWidgetApi.sendSetAlwaysOnScreen(true);
    }

    public joinConference(updateStatusMessage = true) {
        if (updateStatusMessage) {
            // Inform the user that we're loading their meeting
            this.statusMessage = "Joining conference...";
        }

        // Make a request to Dimension requesting the join URL
        if (this.createMeeting) {
            // Ask Dimension to return a URL for joining a meeting that it created
            this.joinThroughDimension();
        } else {
            // Provide Dimension with a Greenlight URL, which it will transform into
            // a BBB meeting URL
            this.joinThroughGreenlightUrl();
        }
    }

    // Ask Dimension to create a meeting (or use an existing one) for this room and return the embeddable meeting URL
    private async joinThroughDimension() {
        console.log(
            "BigBlueButton: Joining meeting created by Dimension with meeting ID: " +
            this.meetingId
        );

        this.bigBlueButtonApi
            .getJoinUrl(
                this.displayName,
                this.userId,
                this.avatarUrl,
                this.meetingId,
                this.meetingPassword
            )
            .then((response) => {
                if ("errorCode" in response) {
                    // This is an instance of ApiError
                    if (response.errorCode === "UNKNOWN_MEETING_ID") {
                        // This meeting ID is invalid.
                        // Inform the user that they should try and start a new meeting
                        this.statusMessage = "This meeting has ended or otherwise does not exist.<br>Please start a new meeting.";
                        return;
                    }

                    if (response.errorCode === "MEETING_HAS_ENDED") {
                        // It's likely that everyone has left the meeting, and it's been garbage collected.
                        // Inform the user that they should try and start a new meeting
                        this.statusMessage = "This meeting has ended.<br>Please start a new meeting.";
                        return;
                    }
                    // Otherwise this is a generic error
                    this.statusMessage = "An error occurred while loading the meeting";
                }

                // Retrieve and embed the meeting URL
                const joinUrl = (response as FE_BigBlueButtonCreateAndJoinMeeting).url;
                this.embedMeetingWithUrl(joinUrl);
            });
    }

    // Hand Dimension a Greenlight URL and receive a translated, embeddable meeting URL in response
    private joinThroughGreenlightUrl() {
        console.log(
            "BigBlueButton: joining via greenlight url:",
            this.conferenceUrl
        );
        this.bigBlueButtonApi
            .joinMeetingWithGreenlightUrl(this.conferenceUrl, this.joinName)
            .then((response) => {
                if ("errorCode" in response) {
                    // This is an instance of ApiError
                    if (response.errorCode === "WAITING_FOR_MEETING_START") {
                        // The meeting hasn't started yet
                        this.statusMessage = "Waiting for conference to start...";

                        // Poll until it has
                        setTimeout(
                            this.joinConference.bind(this),
                            this.pollIntervalMillis,
                            false
                        );
                        return;
                    }

                    // Otherwise this is a generic error
                    this.statusMessage = "An error occurred while loading the meeting";
                }

                // Retrieve and embed the meeting URL
                const joinUrl = (response as FE_BigBlueButtonJoin).url;
                this.embedMeetingWithUrl(joinUrl);
            });
    }

    private embedMeetingWithUrl(url: string) {
        // Hide widget-related UI
        this.statusMessage = null;

        // Embed the return meeting URL, joining the meeting
        this.canEmbed = true;
        this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

        // Inform the client that we would like the meeting to remain visible for its duration
        ScalarWidgetApi.sendSetAlwaysOnScreen(true);
    }

    public ngOnDestroy() {
        if (this.bigBlueButtonApiSubscription) {
            this.bigBlueButtonApiSubscription.unsubscribe();
        }
    }

    protected onCapabilitiesSent(): void {
        super.onCapabilitiesSent();

        // Don't set alwaysOnScreen until we start a meeting
        ScalarWidgetApi.sendSetAlwaysOnScreen(false);
    }
}
