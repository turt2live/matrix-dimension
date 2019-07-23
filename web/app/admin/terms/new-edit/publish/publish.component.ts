import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { ToasterService } from "angular2-toaster";

export class AdminTermsNewEditPublishDialogContext extends BSModalContext {
}

@Component({
    templateUrl: "./publish.component.html",
    styleUrls: ["./publish.component.scss"],
})
export class AdminTermsNewEditPublishDialogComponent implements ModalComponent<AdminTermsNewEditPublishDialogContext> {

    public version: string;

    constructor(public dialog: DialogRef<AdminTermsNewEditPublishDialogContext>, private toaster: ToasterService) {
    }

    public publish() {
        if (!this.version || !this.version.trim()) {
            this.toaster.pop("warning", "Please enter a version number");
            return;
        }
        this.dialog.close(this.version);
    }
}
