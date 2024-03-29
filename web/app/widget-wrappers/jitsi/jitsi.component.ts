import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as $ from "jquery";
import { FE_JitsiWidget } from "../../shared/models/integration";
import { WidgetApiService } from "../../shared/services/integrations/widget-api.service";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../../shared/services/scalar/scalar-widget.api";
import { CapableWidget } from "../capable-widget";

declare let JitsiMeetExternalAPI: any;

@Component({
    selector: "my-jitsi-widget-wrapper",
    templateUrl: "jitsi.component.html",
    styleUrls: ["jitsi.component.scss"],
})
export class JitsiWidgetWrapperComponent
    extends CapableWidget
    implements OnInit, OnDestroy {
    public isJoined = false;
    public toggleVideo = false;

    private domain: string;
    private conferenceId: string;
    private displayName: string;
    private avatarUrl: string;
    private userId: string;
    private isAudioOnly: boolean;
    private jitsiApiObj: any;
    private jitsiApiSubscription: Subscription;

    constructor(
        activatedRoute: ActivatedRoute,
        private widgetApi: WidgetApiService
    ) {
        super();
        this.supportsAlwaysOnScreen = true;

        const params: any = activatedRoute.snapshot.queryParams;

        this.domain = params.domain;
        this.conferenceId = params.conferenceId || params.confId;
        this.displayName = params.displayName;
        this.avatarUrl = params.avatarUrl;
        this.userId = params.userId || params.email; // Element uses `email` when placing a conference call
        this.isAudioOnly = params.isAudioOnly === "true";
        this.toggleVideo = !this.isAudioOnly;

        // Set the widget ID if we have it
        ScalarWidgetApi.widgetId = params.widgetId;
    }

    public ngOnInit() {
        super.ngOnInit();
        this.widgetApi.getWidget("jitsi").then((integration) => {
            const widget = <FE_JitsiWidget>integration;
            $.getScript(widget.options.scriptUrl);

            if (!this.domain) {
                // Always fall back to jitsi.riot.im to maintain compatibility with widgets created by Element.
                this.domain = widget.options.useDomainAsDefault
                    ? widget.options.jitsiDomain
                    : "jitsi.riot.im";
            }
        });
        this.jitsiApiSubscription = ScalarWidgetApi.requestReceived.subscribe(
            (request) => {
                if (!this.isJoined) {
                    return;
                }

                switch (request.action) {
                    case "audioToggle":
                        this.jitsiApiObj.executeCommand("toggleAudio");
                        break;
                    case "audioMute":
                        this.jitsiApiObj.isAudioMuted().then((muted) => {
                            // Toggle audio if Jitsi is not currently muted
                            if (!muted) {
                                this.jitsiApiObj.executeCommand("toggleAudio");
                            }
                        });
                        break;
                    case "audioUnmute":
                        this.jitsiApiObj.isAudioMuted().then((muted) => {
                            // Toggle audio if Jitsi is currently muted
                            if (muted) {
                                this.jitsiApiObj.executeCommand("toggleAudio");
                            }
                        });
                        break;
                    default:
                        // Unknown command sent
                        return;
                }

                ScalarWidgetApi.replyAcknowledge(request);
            }
        );
    }

    public joinConference() {
        $(".join-conference-wrapper").hide();
        $("#jitsiContainer").show();

        ScalarWidgetApi.sendSetAlwaysOnScreen(true);

        this.jitsiApiObj = new JitsiMeetExternalAPI(this.domain, {
            width: "100%",
            height: "100%",
            parentNode: document.querySelector("#jitsiContainer"),
            roomName: this.conferenceId,
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                MAIN_TOOLBAR_BUTTONS: [],
                VIDEO_LAYOUT_FIT: "height",
            },
        });
        if (this.displayName)
            this.jitsiApiObj.executeCommand("displayName", this.displayName);
        if (this.avatarUrl)
            this.jitsiApiObj.executeCommand("avatarUrl", this.avatarUrl.toString());
        if (this.userId) this.jitsiApiObj.executeCommand("email", this.userId);
        if (this.isAudioOnly === this.toggleVideo)
            this.jitsiApiObj.executeCommand("toggleVideo");

        this.jitsiApiObj.on("readyToClose", () => {
            this.isJoined = false;
            ScalarWidgetApi.sendSetAlwaysOnScreen(false);
            $(".join-conference-wrapper").show();
            $("#jitsiContainer").hide().html("");
        });

        this.isJoined = true;
    }

    public ngOnDestroy() {
        if (this.jitsiApiSubscription) this.jitsiApiSubscription.unsubscribe();
    }

    protected onCapabilitiesSent(): void {
        super.onCapabilitiesSent();
        ScalarWidgetApi.sendSetAlwaysOnScreen(false);
    }
}
