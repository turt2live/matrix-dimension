import { ComplexBotComponent } from "../complex-bot.component";
import { Component } from "@angular/core";

interface RssConfig {
    feeds: {
        [feedUrl: string]: {}; // No options currently
    };
}

@Component({
    templateUrl: "rss.complex-bot.component.html",
    styleUrls: ["rss.complex-bot.component.scss"],
})
export class RssComplexBotConfigComponent extends ComplexBotComponent<RssConfig> {
    constructor() {
        super("rss");
    }
}