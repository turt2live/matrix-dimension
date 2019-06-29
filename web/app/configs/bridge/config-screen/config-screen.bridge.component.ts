import { Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { BridgeComponent } from "../bridge.component";

@Component({
    selector: "my-bridge-config",
    templateUrl: "config-screen.bridge.component.html",
    styleUrls: ["config-screen.bridge.component.scss"],
})
export class ConfigScreenBridgeComponent {

    @Input() bridgeComponent: BridgeComponent<any>;
    @ContentChild(TemplateRef, {static: false}) bridgeParamsTemplate: TemplateRef<any>;

    constructor() {
    }
}