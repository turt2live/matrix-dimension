import { Directive, HostListener } from "@angular/core";
import * as screenfull from 'screenfull';

@Directive({
    selector: '[toggleFullscreen]',
})
export class ToggleFullscreenDirective {

    @HostListener('click') onClick() {
        // HACK: This should be behind a service in the event the library changes
        if (screenfull.enabled) {
            screenfull.toggle();
        }
    }

}
