import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { WidgetApiService } from "../../shared/services/integrations/widget-api.service";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { CapableWidget } from "../capable-widget";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { BigBlueButtonApiService } from "../../shared/services/integrations/bigbluebutton-api.service";
import { FE_BigBlueButtonCreateAndJoinMeeting, FE_BigBlueButtonJoin } from "../../shared/models/integration";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "my-bigbluebutton-widget-wrapper",
    templateUrl: "bigbluebutton.component.html",
    styleUrls: ["bigbluebutton.component.scss"],
})
export class BigBlueButtonWidgetWrapperComponent extends CapableWidget implements OnInit, OnDestroy {

    public canEmbed = true;

    /**
     * User metadata passed to us by the client
     */
    private conferenceUrl: string;
    private displayName: string;
    private userId: string;

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

    constructor(activatedRoute: ActivatedRoute,
                private bigBlueButtonApi: BigBlueButtonApiService,
                private widgetApi: WidgetApiService,
                private sanitizer: DomSanitizer,
                public translate: TranslateService) {
        super();
        this.supportsAlwaysOnScreen = true;

        let params: any = activatedRoute.snapshot.queryParams;

        this.roomId = params.roomId;
        this.createMeeting = params.createMeeting;
        this.conferenceUrl = params.conferenceUrl;
        this.displayName = params.displayName;
        this.userId = params.userId || params.email; // Element uses `email` when placing a conference call

        // Create a nick to display in the meeting
        this.joinName = `${this.displayName} (${this.userId})`;

        // TODO: As of BigBlueButton 2.3, Avatar URLs are supported in /join, which would allow us to set the
        // user's avatar in BigBlueButton to that of their Matrix ID.

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
            // Ask Dimension to create the meeting for us and return the URL
            this.createAndJoinMeeting();
        } else {
            // Provide Dimension with a Greenlight URL, which it will transform into
            // a BBB meeting URL
            this.joinThroughGreenlightUrl();
        }
    }

    // Ask Dimension to create a meeting (or use an existing one) for this room and return the embeddable meeting URL
    private createAndJoinMeeting() {
        console.log("BigBlueButton: joining and creating meeting if it doesn't already exist, with fullname:", this.joinName);

        this.bigBlueButtonApi.createAndJoinMeeting(this.roomId, this.joinName).then((response) => {
            if ("errorCode" in response) {
                // This is an instance of ApiError
                // if (response.errorCode === "WAITING_FOR_MEETING_START") {
                //     // The meeting hasn't started yet
                //     this.statusMessage = "Waiting for conference to start...";
                //
                //     // Poll until it has
                //     setTimeout(this.joinConference.bind(this), this.pollIntervalMillis, false);
                //     return;
                // }

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
        console.log("BigBlueButton: joining via greenlight url:", this.conferenceUrl);
        this.bigBlueButtonApi.joinMeetingWithGreenlightUrl(this.conferenceUrl, this.joinName).then((response) => {
            if ("errorCode" in response) {
                // This is an instance of ApiError
                if (response.errorCode === "WAITING_FOR_MEETING_START") {
                    // The meeting hasn't started yet
                    this.statusMessage = "Waiting for conference to start...";

                    // Poll until it has
                    setTimeout(this.joinConference.bind(this), this.pollIntervalMillis, false);
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
        this.canEmbed = true;
        this.statusMessage = null;
        this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        return
        // Check if the given URL is embeddable
        this.widgetApi.isEmbeddable(url).then(result => {
            this.canEmbed = result.canEmbed;
            this.statusMessage = null;

            // Embed the return meeting URL, joining the meeting
            this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            // Inform the client that we would like the meeting to remain visible for its duration
            ScalarWidgetApi.sendSetAlwaysOnScreen(true);
        }).catch(err => {
            console.error(err);
            this.canEmbed = false;
            this.statusMessage = "Unable to embed meeting";
        });
    }

    public ngOnDestroy() {
        if (this.bigBlueButtonApiSubscription) this.bigBlueButtonApiSubscription.unsubscribe();
    }

    protected onCapabilitiesSent(): void {
        super.onCapabilitiesSent();
        ScalarWidgetApi.sendSetAlwaysOnScreen(false);
    }

}
