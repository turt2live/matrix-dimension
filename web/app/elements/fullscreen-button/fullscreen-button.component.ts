import { Component, OnDestroy, OnInit } from "@angular/core";
import * as screenfull from "screenfull";

@Component({
    selector: "my-fullscreen-button",
    templateUrl: "fullscreen-button.component.html",
    styleUrls: ["fullscreen-button.component.scss"],
})
export class FullscreenButtonComponent implements OnDestroy, OnInit {
    public isFullscreen = false;

    private listener = null;

    constructor() {
    // Do stuff
    }

    public ngOnInit(): void {
    // @ts-ignore
        this.listener = screenfull.on("change", () => {
            // @ts-ignore
            this.isFullscreen = screenfull.isFullscreen;
        });
        // @ts-ignore
        this.isFullscreen = screenfull.isFullscreen;
    }

    public ngOnDestroy(): void {
        if (this.listener) {
            // @ts-ignore
            screenfull.off(this.listener);
        }
    }
}
