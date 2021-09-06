import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToasterService } from "angular2-toaster";
import { AdminIrcApiService } from "../../../../shared/services/admin/admin-irc-api.service";
import { TranslateService } from "@ngx-translate/core";

export interface AddSelfhostedIrcBridgeDialogContextt {
    isSaving: boolean;
    provisionUrl: string;
}

@Component({
    templateUrl: "./add-selfhosted.component.html",
    styleUrls: ["./add-selfhosted.component.scss"],
})
export class AdminIrcBridgeAddSelfhostedComponent {

    public isSaving = false;
    public provisionUrl: string;

    constructor(public modal: NgbActiveModal,
        private ircApi: AdminIrcApiService,
        private toaster: ToasterService,
        public translate: TranslateService) {
        this.translate = translate;
    }

    public add() {
        this.isSaving = true;
        this.ircApi.newSelfhosted(this.provisionUrl).then(() => {
            this.translate.get('IRC Bridge added').subscribe((res: string) => {
                this.toaster.pop("success", res);
            });
            this.modal.close();
        }).catch(err => {
            console.error(err);
            this.isSaving = false;
            this.translate.get('Failed to create IRC bridge').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }
}
