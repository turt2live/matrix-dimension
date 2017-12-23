import { NewWidgetComponent } from "../widget.component";
import { Component, ContentChild, Input, TemplateRef } from "@angular/core";

@Component({
    selector: "my-widget-config",
    templateUrl: "config_screen.component.html",
    styleUrls: ["config_screen.widget.component.scss"],
})
export class ConfigScreenWidgetComponent {

    @Input() widgetComponent: NewWidgetComponent;
    @ContentChild(TemplateRef) widgetParamsTemplate: TemplateRef<any>;

    constructor() {
    }
}