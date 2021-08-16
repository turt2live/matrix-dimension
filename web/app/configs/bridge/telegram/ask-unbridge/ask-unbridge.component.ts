import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

export interface AskUnbridgeDialogContext {
}

@Component({
    templateUrl: "./ask-unbridge.component.html",
    styleUrls: ["./ask-unbridge.component.scss"],
})
export class TelegramAskUnbridgeComponent {

    constructor(public modal: NgbActiveModal) {
    }

    public unbridgeAndContinue(): void {
        this.modal.close({unbridge: true});
    }

    public cancel(): void {
        this.modal.close({unbridge: false});
    }
}
