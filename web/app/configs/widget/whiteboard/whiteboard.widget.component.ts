import { WidgetComponent } from "../widget.component";
import { Component } from "@angular/core";
import { EditableWidget, WIDGET_WHITEBOARD } from "../../../shared/models/widget";
import * as url from "url";
import { SessionStorage } from "../../../shared/SessionStorage";
import { NameService } from "../../../shared/services/name.service";
import { FE_WhiteBoardWidget } from "../../../shared/models/integration";

@Component({
    templateUrl: "whiteboard.widget.component.html",
    styleUrls: ["whiteboard.widget.component.scss"],
})
export class WhiteboardWidgetComponent extends WidgetComponent {
    private whiteBoardWidget: FE_WhiteBoardWidget = <FE_WhiteBoardWidget>SessionStorage.editIntegration;

    constructor(private nameService: NameService) {
        super(WIDGET_WHITEBOARD, "Whiteboard", "generic", "whiteboard", "boardName");
    }
    protected OnWidgetsDiscovered(widgets: EditableWidget[]): void {
        console.log(widgets);
        for (const widget of widgets) {
            if (!widget.dimension.newUrl.startsWith("http://") && !widget.dimension.newUrl.startsWith("https://")) {
                const parsedUrl = url.parse(widget.url, true);
                const boardName = parsedUrl.query["boardName"];

                // Set the new URL so that it unpacks correctly
                widget.url = `https://dev-whiteboard.nordeck.net/?whiteboardid=${boardName}`;
            }
        }
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        const name = this.nameService.getHumanReadableName();

        let template = "https://dev-whiteboard.nordeck.net/?whiteboardid=$roomId_$boardName";
        if (this.whiteBoardWidget.options && this.whiteBoardWidget.options.defaultUrl) {
            template = this.whiteBoardWidget.options.defaultUrl;
        }

        template = template.replace("$roomId", encodeURIComponent(SessionStorage.roomId));
        template = template.replace("$boardName", encodeURIComponent(name));

        widget.dimension.newUrl = template;
        widget.dimension.newName = name;
    }
}
