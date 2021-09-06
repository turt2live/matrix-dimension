import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

export interface LogoutConfirmationDialogContext {
}

@Component({
    templateUrl: "./logout-confirmation.component.html",
    styleUrls: ["./logout-confirmation.component.scss"],
})
export class AdminLogoutConfirmationDialogComponent {

    constructor(public modal: NgbActiveModal) {
    }
}
