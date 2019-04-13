import { Directive, HostListener } from "@angular/core";
import * as screenfull from "screenfull";

@Directive({
    selector: "[myToggleFullscreen]",
})
export class ToggleFullscreenDirective {

    @HostListener("click")
    onClick() {
        // HACK: This should be behind a service in the event the library changes
        // @ts-ignore
        if (screenfull.enabled) {
            // @ts-ignore
            screenfull.toggle();
        }
    }

}
