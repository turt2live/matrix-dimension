import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/services/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { WIDGET_ETHERPAD } from "../../../shared/models/widget";
import { EtherpadWidgetIntegration } from "../../../shared/models/integration";

@Component({
    selector: "my-etherpadwidget-config",
    templateUrl: "etherpad-config.component.html",
    styleUrls: ["etherpad-config.component.scss", "./../../config.component.scss"],
})
export class EtherpadWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    private widgetOpts: EtherpadWidgetIntegration;

    constructor(public dialog: DialogRef<ConfigModalContext>,
                toaster: ToasterService,
                scalarService: ScalarService,
                window: Window) {
        super(
            window,
            toaster,
            scalarService,
            dialog.context.roomId,
            dialog.context.integration,
            dialog.context.integrationId,
            WIDGET_ETHERPAD,
            "Etherpad Widget",
            "generic", // wrapper
            "etherpad" // scalar wrapper
        );

        this.widgetOpts = <EtherpadWidgetIntegration>dialog.context.integration;
    }

    public validateAndAddWidget() {
        if (this.newWidget.dimension.newUrl.startsWith("http://") || this.newWidget.dimension.newUrl.startsWith("https://")) {
            this.newWidget.dimension.newName = "Etherpad";
        } else {
            this.newWidget.dimension.newName = this.newWidget.dimension.newUrl;
            this.newWidget.dimension.newUrl = this.generatePadUrl(this.newWidget.dimension.newName);
        }

        this.addWidget();
    }

    private generatePadUrl(forName: string): string {
        let template = "https://demo.riot.im/etherpad/p/$roomId_$padName";
        if (this.widgetOpts && this.widgetOpts.defaultUrl) {
            template = this.widgetOpts.defaultUrl;
        }

        template = template.replace("$roomId", encodeURIComponent(this.roomId));
        template = template.replace("$padName", encodeURIComponent(forName));

        return template;
    }
}
