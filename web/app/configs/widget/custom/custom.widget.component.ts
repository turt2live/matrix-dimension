import { WidgetComponent } from "../widget.component";
import { WIDGET_CUSTOM } from "../../../shared/models/widget";
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "custom.widget.component.html",
    styleUrls: ["custom.widget.component.scss"],
})
export class CustomWidgetConfigComponent extends WidgetComponent {
    constructor(public translate: TranslateService) {
        super(WIDGET_CUSTOM, "Custom Widget", "generic", translate);
    }
}
