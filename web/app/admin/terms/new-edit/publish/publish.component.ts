import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from "ngx-modialog/plugins/bootstrap";
import { ToasterService } from "angular2-toaster";
import { TranslateService } from "@ngx-translate/core";

export class AdminTermsNewEditPublishDialogContext extends BSModalContext {
}

@Component({
    templateUrl: "./publish.component.html",
    styleUrls: ["./publish.component.scss"],
})
export class AdminTermsNewEditPublishDialogComponent implements ModalComponent<AdminTermsNewEditPublishDialogContext> {

    public version: string;

    constructor(public dialog: DialogRef<AdminTermsNewEditPublishDialogContext>, private toaster: ToasterService, public translate: TranslateService) {
    }

    public publish() {
        if (!this.version || !this.version.trim()) {
            this.translate.get('Please enter a version number').subscribe((res: string) => {this.toaster.pop("warning", res); });
            return;
        }
        this.dialog.close(this.version);
    }
}
