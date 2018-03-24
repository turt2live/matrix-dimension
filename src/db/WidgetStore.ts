import WidgetRecord from "./models/WidgetRecord";
import { Widget } from "../integrations/Widget";

export class WidgetStore {

    public static async listAll(isEnabled?: boolean): Promise<Widget[]> {
        let conditions = {};
        if (isEnabled === true || isEnabled === false) conditions = {where: {isEnabled: isEnabled}};
        return (await WidgetRecord.findAll(conditions)).map(w => new Widget(w));
    }

    public static async setEnabled(type: string, isEnabled: boolean): Promise<any> {
        const widget = await WidgetRecord.findOne({where: {type: type}});
        if (!widget) throw new Error("Widget not found");

        widget.isEnabled = isEnabled;
        return widget.save();
    }

    public static async setOptions(type: string, options: any): Promise<any> {
        const optionsJson = JSON.stringify(options);

        const widget = await WidgetRecord.findOne({where: {type: type}});
        if (!widget) throw new Error("Widget not found");

        widget.optionsJson = optionsJson;
        return await widget.save();
    }

    private constructor() {
    }

}