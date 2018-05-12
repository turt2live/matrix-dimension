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
        })
    }

    public ngOnDestroy() {
        if (this.widgetApiSubscription) this.widgetApiSubscription.unsubscribe();
    }

    private takeScreenshot(request: ScalarToWidgetRequest) {
        domtoimage.toBlob(this.el.nativeElement).then(b => {
            ScalarWidgetApi.replyScreenshot(request, b);
        }).catch(error => {
            console.error(error);
            ScalarWidgetApi.replyError(request, error, "Failed to take screenshot");
        });
    }
}
