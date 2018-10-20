import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";

export class AskUnbridgeDialogContext extends BSModalContext {
}

@Component({
    templateUrl: "./ask-unbridge.component.html",
    styleUrls: ["./ask-unbridge.component.scss"],
})
export class TelegramAskUnbridgeComponent implements ModalComponent<AskUnbridgeDialogContext> {

    constructor(public dialog: DialogRef<AskUnbridgeDialogContext>) {
    }

    public unbridgeAndContinue(): void {
        this.dialog.close({unbridge: true});
    }

    public cancel(): void {
        this.dialog.close({unbridge: false});
    }
}
