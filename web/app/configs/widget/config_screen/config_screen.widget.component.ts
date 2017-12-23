import { WidgetComponent } from "../widget.component";
import { Component, ContentChild, Input, TemplateRef } from "@angular/core";

@Component({
    selector: "my-widget-config",
    templateUrl: "config_screen.component.html",
    styleUrls: ["config_screen.widget.component.scss"],
})
export class ConfigScreenWidgetComponent {

    @Input() widgetComponent: WidgetComponent;
    @ContentChild(TemplateRef) widgetParamsTemplate: TemplateRef<any>;

    constructor() {
    }
}