import { Component } from "@angular/core";
import { ModalComponent, DialogRef } from "ngx-modialog";
import { WidgetComponent } from "../widget.component";
import { ScalarService } from "../../../shared/scalar.service";
import { ConfigModalContext } from "../../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { Widget, WIDGET_DIM_ETHERPAD, WIDGET_SCALAR_ETHERPAD } from "../../../shared/models/widget";

@Component({
    selector: "my-etherpadwidget-config",
    templateUrl: "etherpad-config.component.html",
    styleUrls: ["etherpad-config.component.scss", "./../../config.component.scss"],
})
export class EtherpadWidgetConfigComponent extends WidgetComponent implements ModalComponent<ConfigModalContext> {

    public newEtherpadServerUrl: string = "";
    public useCustomServer = false;
    public editUseCustomServer = false;

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
            dialog.context.integrationId,
            "Etherpad Widget",
            "generic", // wrapper
            "etherpad" // scalar wrapper
        );
    }

    getPadURL(widget?: Widget): string {
        let url: string;
        if (widget) {
            if (this.editUseCustomServer) {
                url = widget.data.newPadServer + this.roomId + "_" + widget.data.newPadName;
            } else {
                url = "https://demo.riot.im/etherpad/p/" + this.roomId + "_" + widget.data.newPadName;
            }
        } else {
            if (this.useCustomServer) {
                url = this.newEtherpadServerUrl + this.roomId + "_" + this.newWidgetUrl;
            } else {
                url = "https://demo.riot.im/etherpad/p/" + this.roomId + "_" + this.newWidgetUrl;
            }
        }
        return url;
    }

    private checkPadURL(url: string, widget?: Widget): boolean {
        if (widget) {
            if (this.editUseCustomServer) {
                return Boolean(url === widget.data.newPadServer);
            } else {
                return Boolean(url === "https://demo.riot.im/etherpad/p/");
            }
        } else {
            if (this.useCustomServer) {
                return Boolean(url === this.newEtherpadServerUrl);
            } else {
                return Boolean(url === "https://demo.riot.im/etherpad/p/");
            }
        }
    }

    public validateAndAddWidget() {
        const url = this.getPadURL() + "?userName=$matrix_user_id";

        if (this.checkPadURL(url)) {
            this.toaster.pop("warning", "Please enter a Pad Name");
            return;
        }

        const originalUrl = this.roomId + "_" + this.newWidgetUrl;
        this.newWidgetUrl = url;

        if (this.useCustomServer) {
            this.addWidget({padName: originalUrl, padSuffix: originalUrl, padServer: this.newEtherpadServerUrl});
        } else {
            this.addWidget({padName: originalUrl, padSuffix: originalUrl, padServer: "https://demo.riot.im/etherpad/p/"});
        }
    }

    public validateAndSaveWidget(widget: Widget) {
        const url = this.getPadURL(widget) + "?userName=$matrix_user_id";

        if (this.checkPadURL(url, widget)) {
            this.toaster.pop("warning", "Please enter a Pad Name");
            return;
        }

        if (!widget.data) widget.data = {};

        widget.newUrl = url;
        widget.data.padName = widget.data.newPadName;
        widget.data.padSuffix = this.roomId + "_" + widget.data.newPadName;
        if (this.editUseCustomServer) {
            widget.data.padServer = widget.data.newPadServer;
        } else {
            widget.data.padServer = "https://demo.riot.im/etherpad/p/"
        }

        delete widget.data.newPadServer;
        delete widget.data.newPadName;

        this.saveWidget(widget);
    }

    editWidget(widget: Widget) {
        widget.data.newPadName = widget.data.padName;
        widget.data.newPadServer = widget.data.padServer;
        if (widget.data.newPadServer !== "https://demo.riot.im/etherpad/p/") {
            this.editUseCustomServer = true
        }
        super.editWidget(widget);
    }

}
