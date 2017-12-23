import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as $ from "jquery";
import { DimensionApiService } from "../../shared/services/dimension-api.service";
import { JitsiWidget } from "../../shared/models/integration";

declare var JitsiMeetExternalAPI: any;

@Component({
    selector: "my-jitsi-widget-wrapper",
    templateUrl: "jitsi.component.html",
    styleUrls: ["jitsi.component.scss"],
})
export class JitsiWidgetWrapperComponent implements OnInit {

    public isJoined = false;

    private domain: string;
    private conferenceId: string;
    private displayName: string;
    private avatarUrl: string;
    private userId: string;
    private jitsiApiObj: any;

    constructor(activatedRoute: ActivatedRoute, private api: DimensionApiService) {
        let params: any = activatedRoute.snapshot.queryParams;

        this.domain = params.domain;
        this.conferenceId = params.confId || params.conferenceId;
        this.displayName = params.displayName;
        this.avatarUrl = params.avatarUrl;
        this.userId = params.userId;
    }

    public ngOnInit() {
        this.api.getWidget("jitsi").then(integration => {
            const widget = <JitsiWidget>integration;
            $.getScript(widget.options.scriptUrl);
        });
    }

    public joinConference() {
        $(".join-conference-wrapper").hide();
        $("#jitsiContainer").show();

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
            }
        });
        if (this.displayName) this.jitsiApiObj.executeCommand("displayName", this.displayName);
        if (this.avatarUrl) this.jitsiApiObj.executeCommand("avatarUrl", this.avatarUrl.toString());
        if (this.userId) this.jitsiApiObj.executeCommand("email", this.userId);

        this.jitsiApiObj.on("readyToClose", () => {
            this.isJoined = false;
            $(".join-conference-wrapper").show();
            $("#jitsiContainer").hide().html("");
        });

        this.isJoined = true;
    }

}
