import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_GOOGLEDOCS, WIDGET_SCALAR_GOOGLEDOCS } from "../../../shared/models/widget";

@Component({
    selector: "my-googledocswidget-config",
    templateUrl: "googledocs-config.component.html",
    styleUrls: ["googledocs-config.component.scss", "./../../config.component.scss"],
})
export class GoogleDocsWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_GOOGLEDOCS,
            WIDGET_SCALAR_GOOGLEDOCS,
            dialog.context.integration,
            dialog.context.integrationId,
            "Google Docs",
            "generic", // wrapper
            "googleDocs" // scalar wrapper
        );
    }

    public validateAndAddWidget() {
        // We don't actually validate anything here, but we could
        this.addWidget({dimOriginalUrl: this.newWidgetUrl});
    }

    public validateAndSaveWidget(widget: Widget) {
        // We don't actually validate anything here, but we could
        this.saveWidget(widget);
    }
}
