import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarClientApiService } from "../../../shared/services/scalar-client-api.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { WIDGET_GOOGLE_DOCS } from "../../../shared/models/widget";

@Component({
    selector: "my-googledocswidget-config",
    templateUrl: "googledocs-config.component.html",
    styleUrls: ["googledocs-config.component.scss", "./../../config.component.scss"],
})
export class GoogleDocsWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarClientApiService,
                window: Window) {
        super(
            window,
            toaster,
            scalarService,
            dialog.context.roomId,
            dialog.context.integration,
            dialog.context.integrationId,
            WIDGET_GOOGLE_DOCS,
            "Google Docs",
            "generic", // wrapper
            "googleDocs" // scalar wrapper
        );
    }
}
