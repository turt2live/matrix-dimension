import { Component, OnInit } from "@angular/core";
import { FE_EtherpadWidget } from "../../../shared/models/integration";
import { ToasterService } from "angular2-toaster";
import { AdminIntegrationsApiService } from "../../../shared/services/admin/admin-integrations-api.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: "./etherpad.component.html",
    styleUrls: ["./etherpad.component.scss", "../config-dialog.scss"],
})
export class AdminWidgetEtherpadConfigComponent implements OnInit {

    public isUpdating = false;
    public widget: FE_EtherpadWidget;
    private originalWidget = <FE_EtherpadWidget>{};

    constructor(public modal: NgbActiveModal,
        private adminIntegrationsApi: AdminIntegrationsApiService,
        private toaster: ToasterService,
        public translate: TranslateService) {
        this.translate = translate;
    }

    ngOnInit() {
        this.originalWidget = this.widget;
        this.widget = JSON.parse(JSON.stringify(this.originalWidget));
    }

    public save() {
        this.isUpdating = true;
        this.adminIntegrationsApi.setIntegrationOptions(this.widget.category, this.widget.type, this.widget.options).then(() => {
            this.originalWidget.options = this.widget.options;
            this.translate.get('Widget updated').subscribe((res: string) => {
                this.toaster.pop("success", res);
            });
            this.modal.close();
        }).catch(err => {
            this.isUpdating = false;
            console.error(err);
            this.translate.get('Error updating widget').subscribe((res: string) => {
                this.toaster.pop("error", res);
            });
        });
    }
}
