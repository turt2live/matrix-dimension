import { Component, Input } from "@angular/core";
import { Bot } from "../shared/models/bot";

@Component({
    selector: 'my-bot',
    templateUrl: './bot.component.html',
    styleUrls: ['./bot.component.scss'],
})
export class BotComponent {

    @Input() bot: Bot;

    public updating = false;
    public htmlAbout: string;

    constructor() {
    }

    public update(): void {
        this.updating = true;
        setTimeout(() => this.updating = false, Math.random() * 15000);
    }
}
