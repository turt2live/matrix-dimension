import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_ETHERPAD, WIDGET_SCALAR_ETHERPAD } from "../../../shared/models/widget";
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
            toaster,
            scalarService,
            dialog.context.roomId,
            window,
            WIDGET_DIM_ETHERPAD,
            WIDGET_SCALAR_ETHERPAD,
            dialog.context.integration,
            dialog.context.integrationId,
            "Etherpad Widget",
            "generic", // wrapper
            "etherpad" // scalar wrapper
        );

        this.widgetOpts = <EtherpadWidgetIntegration>dialog.context.integration;
    }

    public validateAndAddWidget() {
        if (this.newWidgetUrl.startsWith("http://") || this.newWidgetUrl.startsWith("https://")) {
            this.newWidgetName = "Etherpad";
        } else {
            this.newWidgetName = this.newWidgetUrl;
            this.newWidgetUrl = this.generatePadUrl(this.newWidgetName);
        }

        this.addWidget({dimOriginalUrl: this.newWidgetUrl});
    }

    public validateAndSaveWidget(widget: Widget) {
        if (!widget.data) widget.data = {};
        widget.data.dimOriginalUrl = widget.newUrl;
        this.saveWidget(widget);
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
