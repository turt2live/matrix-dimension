import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";

export class CannotUnbridgeDialogContext extends BSModalContext {
}

@Component({
    templateUrl: "./cannot-unbridge.component.html",
    styleUrls: ["./cannot-unbridge.component.scss"],
})
export class TelegramCannotUnbridgeComponent implements ModalComponent<CannotUnbridgeDialogContext> {

    constructor(public dialog: DialogRef<CannotUnbridgeDialogContext>) {
    }
}
