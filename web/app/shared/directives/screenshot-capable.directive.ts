import { Directive, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { ScalarWidgetApi } from "../services/scalar/scalar-widget.api";
import { ScalarToWidgetRequest } from "../models/scalar-widget-actions";
import * as domtoimage from "dom-to-image";
import { TranslateService } from "@ngx-translate/core";

@Directive({
    selector: "[myScreenshotCapable]",
})
export class ScreenshotCapableDirective implements OnInit, OnDestroy {

    private widgetApiSubscription: Subscription;

    constructor(private el: ElementRef, public translate: TranslateService) {
        this.translate = translate;

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
            this.translate.get('Failed to take screenshot: iframe not supported').subscribe((res: string) => {ScalarWidgetApi.replyError(request, new Error("Cannot take screenshot of iframe"), res); });
        } else {
            domtoimage.toBlob(this.el.nativeElement).then(b => {
                if (!b) {
                    console.warn("No screenshot produced - skipping reply");
                    return;
                }
                ScalarWidgetApi.replyScreenshot(request, b);
            }).catch(error => {
                console.error(error);
                this.translate.get('Failed to take screenshot').subscribe((res: string) => {ScalarWidgetApi.replyError(request, error, res); });
            });
        }
    }
}
