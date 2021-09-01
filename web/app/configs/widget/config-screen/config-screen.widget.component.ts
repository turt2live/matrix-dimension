import { WidgetComponent } from "../widget.component";
import { Component, ContentChild, Input, TemplateRef } from "@angular/core";

@Component({
    selector: "app-widget-config",
    templateUrl: "config-screen.widget.component.html",
    styleUrls: ["config-screen.widget.component.scss"],
})
export class ConfigScreenWidgetComponent {
    @Input() widgetComponent: WidgetComponent;
    @ContentChild(TemplateRef, { static: false })
    widgetParamsTemplate: TemplateRef<any>;

    constructor() {}
}
