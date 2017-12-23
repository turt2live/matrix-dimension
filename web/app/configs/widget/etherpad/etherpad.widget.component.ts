import { WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_ETHERPAD } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { EtherpadWidget } from "../../../shared/models/integration";
import { SessionStorage } from "../../../shared/SessionStorage";
import { NameService } from "../../../shared/services/name.service";

@Component({
    templateUrl: "etherpad.widget.component.html",
    styleUrls: ["etherpad.widget.component.scss"],
})
export class EtherpadWidgetConfigComponent extends WidgetComponent {

    private etherpadWidget: EtherpadWidget = <EtherpadWidget>SessionStorage.editIntegration;

    constructor(private nameService: NameService) {
        super(WIDGET_ETHERPAD, "Etherpad", "generic", "etherpad");
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        const name = this.nameService.getHumanReadableName();

        let template = "https://demo.riot.im/etherpad/p/$roomId_$padName";
        if (this.etherpadWidget.options && this.etherpadWidget.options.defaultUrl) {
            template = this.etherpadWidget.options.defaultUrl;
        }

        template = template.replace("$roomId", encodeURIComponent(SessionStorage.roomId));
        template = template.replace("$padName", encodeURIComponent(name));

        widget.dimension.newUrl = template;
        widget.dimension.newName = name;
    }
}