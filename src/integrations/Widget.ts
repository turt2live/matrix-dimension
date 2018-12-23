import { Integration } from "./Integration";
import WidgetRecord from "../db/models/WidgetRecord";

export interface EtherpadWidgetOptions {
    defaultUrl: string;
}

export interface JitsiWidgetOptions {
    jitsiDomain: string;
    scriptUrl: string;
    useDomainAsDefault: boolean;
}

export class Widget extends Integration {
    public options: any;

    constructor(widgetRecord: WidgetRecord) {
        super(widgetRecord);
        this.category = "widget";
        this.options = widgetRecord.optionsJson ? JSON.parse(widgetRecord.optionsJson) : {};
        this.requirements = [{
            condition: "canSendEventTypes",
            argument: [{isState: true, type: "im.vector.widget"}],
            expectedValue: true,
        }];

        // Technically widgets are supported in encrypted rooms, although at risk.
        this.isEncryptionSupported = true;
    }
}