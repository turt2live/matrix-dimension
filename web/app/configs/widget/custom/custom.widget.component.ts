import { NewWidgetComponent } from "../widget.component";
import { WIDGET_CUSTOM } from "../../../shared/models/widget";
import { Component } from "@angular/core";

@Component({
    templateUrl: "custom.widget.component.html",
    styleUrls: ["custom.widget.component.scss"],
})
export class CustomWidgetConfigComponent extends NewWidgetComponent {
    constructor() {
        super(WIDGET_CUSTOM, "Custom Widget", "generic");
    }
}