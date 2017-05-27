import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Bot } from "../shared/models/bot";

@Component({
    selector: 'my-bot',
    templateUrl: './bot.component.html',
    styleUrls: ['./bot.component.scss'],
})
export class BotComponent {

    @Input() bot: Bot;
    @Output() updated: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    public update(): void {
        this.bot.isEnabled = !this.bot.isEnabled;
        this.updated.emit();
    }
}
