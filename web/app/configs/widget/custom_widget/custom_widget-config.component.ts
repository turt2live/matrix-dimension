import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { WIDGET_DIM_CUSTOM, WIDGET_SCALAR_CUSTOM } from "../../../shared/models/widget";

@Component({
    selector: "my-customwidget-config",
    templateUrl: "custom_widget-config.component.html",
    styleUrls: ["custom_widget-config.component.scss", "./../../config.component.scss"],
})
export class CustomWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_CUSTOM,
            WIDGET_SCALAR_CUSTOM,
            dialog.context.integration,
            dialog.context.integrationId,
            "Custom Widget",
            "generic" // wrapper
        );
    }
}
