import { Component } from "@angular/core";
import { ToasterService } from "angular2-toaster";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

export interface AdminTermsNewEditPublishDialogContext {
}

@Component({
    templateUrl: "./publish.component.html",
    styleUrls: ["./publish.component.scss"],
})
export class AdminTermsNewEditPublishDialogComponent {

    public version: string;

    constructor(public modal: NgbActiveModal, private toaster: ToasterService, public translate: TranslateService) {
    }

    public publish() {
        if (!this.version || !this.version.trim()) {
            this.translate.get('Please enter a version number').subscribe((res: string) => {this.toaster.pop("warning", res); });
            return;
        }
        this.modal.close(this.version);
    }
}
