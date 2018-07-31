import { OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../shared/services/scalar/scalar-widget.api";

export abstract class CapableWidget implements OnInit, OnDestroy {

    private widgetApiSubscription: Subscription;

    // The capabilities we support
    protected supportsScreenshots = false;
    protected supportsStickers = false;
    protected supportsAlwaysOnScreen = false;

    public ngOnInit() {
        this.widgetApiSubscription = ScalarWidgetApi.requestReceived.subscribe(request => {
            if (request.action === "capabilities") {
                const capabilities = [];

                if (this.supportsScreenshots) capabilities.push("m.capability.screenshot");
                if (this.supportsStickers) capabilities.push("m.sticker");
                if (this.supportsAlwaysOnScreen) capabilities.push("m.always_on_screen");

                ScalarWidgetApi.replyCapabilities(request, capabilities);
                this.onCapabilitiesSent();
            }
        });
    }

    public ngOnDestroy() {
        if (this.widgetApiSubscription) this.widgetApiSubscription.unsubscribe();
    }

    protected onCapabilitiesSent(): void {
        if (this.supportsAlwaysOnScreen) ScalarWidgetApi.sendSetAlwaysOnScreen(true);
    }
}