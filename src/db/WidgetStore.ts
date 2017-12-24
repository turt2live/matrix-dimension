import * as Promise from "bluebird";
import WidgetRecord from "./models/WidgetRecord";
import { Widget } from "../integrations/Widget";
import { resolveIfExists } from "./DimensionStore";

export class WidgetStore {

    public static listAll(isEnabled?: boolean): Promise<Widget[]> {
        let conditions = {};
        if (isEnabled === true || isEnabled === false) conditions = {where: {isEnabled: isEnabled}};
        return WidgetRecord.findAll(conditions).then(widgets => widgets.map(w => new Widget(w)));
    }

    public static setEnabled(type: string, isEnabled: boolean): Promise<any> {
        return WidgetRecord.findOne({where: {type: type}}).then(resolveIfExists).then(widget => {
            widget.isEnabled = isEnabled;
            return widget.save();
        });
    }

    public static setOptions(type: string, options: any): Promise<any> {
        const optionsJson = JSON.stringify(options);
        return WidgetRecord.findOne({where: {type: type}}).then(resolveIfExists).then(widget => {
            widget.optionsJson = optionsJson;
            return widget.save();
        });
    }

    private constructor() {
    }

}