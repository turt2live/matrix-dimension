import { ComplexBotComponent } from "../complex-bot.component";
import { Component, ContentChild, Input, TemplateRef } from "@angular/core";

@Component({
    selector: "my-complex-bot-config",
    templateUrl: "config-screen.complex-bot.component.html",
    styleUrls: ["config-screen.complex-bot.component.scss"],
})
export class ConfigScreenComplexBotComponent {
    @Input() botComponent: ComplexBotComponent<any>;
    @ContentChild(TemplateRef, { static: false })
    botParamsTemplate: TemplateRef<any>;

    constructor() {}
}
