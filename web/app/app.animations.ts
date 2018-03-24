import { animate, style, transition, trigger } from "@angular/animations";

export const ANIMATION_FADE_IN_NOT_OUT =
    trigger('fadeInNotOutAnimation', [
        transition(':enter', [
            style({opacity: 0}),
            animate('200ms', style({opacity: 1})),
        ]),
        // transition(':leave', [
        //     style({opacity: 1}),
        //     animate('100ms', style({opacity: 0})),
        // ]),
    ]);