import { WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_ETHERPAD } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { FE_EtherpadWidget } from "../../../shared/models/integration";
import { SessionStorage } from "../../../shared/SessionStorage";
import { NameService } from "../../../shared/services/name.service";
import * as url from "url";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "etherpad.widget.component.html",
    styleUrls: ["etherpad.widget.component.scss"],
})
export class EtherpadWidgetConfigComponent extends WidgetComponent {

    private etherpadWidget: FE_EtherpadWidget = <FE_EtherpadWidget>SessionStorage.editIntegration;

    constructor(private nameService: NameService, public translate: TranslateService) {
        super(WIDGET_ETHERPAD, "Notes", "generic", translate, "etherpad", "padName");
    }

    protected OnWidgetsDiscovered(widgets: EditableWidget[]): void {
        for (const widget of widgets) {
            if (!widget.dimension.newUrl.startsWith("http://") && !widget.dimension.newUrl.startsWith("https://")) {
                const parsedUrl = url.parse(widget.url, true);
                const padName = parsedUrl.query["padName"];

                // Set the new URL so that it unpacks correctly
                widget.url = `https://scalar.vector.im/etherpad/p/${padName}`;
            }
        }
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        const name = this.nameService.getHumanReadableName();

        let template = "https://scalar.vector.im/etherpad/p/$roomId_$padName";
        if (this.etherpadWidget.options && this.etherpadWidget.options.defaultUrl) {
            template = this.etherpadWidget.options.defaultUrl;
        }

        template = template.replace("$roomId", encodeURIComponent(SessionStorage.roomId).slice(0, 10));
        template = template.replace("$padName", encodeURIComponent(name));

        widget.dimension.newUrl = template;
        widget.dimension.newName = name;
    }
}
