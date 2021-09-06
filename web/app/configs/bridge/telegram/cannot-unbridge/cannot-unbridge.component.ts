import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

export interface CannotUnbridgeDialogContext {
}

@Component({
    templateUrl: "./cannot-unbridge.component.html",
    styleUrls: ["./cannot-unbridge.component.scss"],
})
export class TelegramCannotUnbridgeComponent {

    constructor(public modal: NgbActiveModal) {
    }
}
