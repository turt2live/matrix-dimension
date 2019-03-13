import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";

export class LogoutConfirmationDialogContext extends BSModalContext {
}

@Component({
    templateUrl: "./logout-confirmation.component.html",
    styleUrls: ["./logout-confirmation.component.scss"],
})
export class AdminLogoutConfirmationDialogComponent implements ModalComponent<LogoutConfirmationDialogContext> {

    constructor(public dialog: DialogRef<LogoutConfirmationDialogContext>) {}
}
