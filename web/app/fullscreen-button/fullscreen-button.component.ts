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
        this.listener = screenfull.on("change", () => {
            this.isFullscreen = screenfull.isFullscreen;
        });
        this.isFullscreen = screenfull.isFullscreen;
    }

    public ngOnDestroy(): void {
        if (this.listener) {
            screenfull.off(this.listener);
        }
    }
}
