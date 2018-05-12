import { Directive, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../services/scalar/scalar-widget.api";
import { ScalarToWidgetRequest } from "../models/scalar-widget-actions";
import * as domtoimage from "dom-to-image";

@Directive({
    selector: "[myScreenshotCapable]",
})
export class ScreenshotCapableDirective implements OnInit, OnDestroy {

    private widgetApiSubscription: Subscription;

    constructor(private el: ElementRef) {

    }

    public ngOnInit() {
        this.widgetApiSubscription = ScalarWidgetApi.requestReceived.subscribe(request => {
            if (request.action === "screenshot") this.takeScreenshot(request);
        });
    }

    public ngOnDestroy() {
        if (this.widgetApiSubscription) this.widgetApiSubscription.unsubscribe();
    }

    private takeScreenshot(request: ScalarToWidgetRequest) {
        if (this.el.nativeElement.tagName === "IFRAME") {
            console.error("Attempted to take a screenshot of an iframe");
            ScalarWidgetApi.replyError(request, new Error("Cannot take screenshot of iframe"), "Failed to take screenshot: iframe not supported");
        } else {
            domtoimage.toBlob(this.el.nativeElement).then(b => {
                if (!b) {
                    console.warn("No screenshot produced - skipping reply");
                    return;
                }
                ScalarWidgetApi.replyScreenshot(request, b);
            }).catch(error => {
                console.error(error);
                ScalarWidgetApi.replyError(request, error, "Failed to take screenshot");
            });
        }
    }
}
