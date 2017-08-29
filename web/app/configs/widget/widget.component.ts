import { ScalarService } from "../../shared/scalar.service";
import { Widget, ScalarToWidgets } from "../../shared/models/widget";

export class WidgetComponent {

    constructor(protected scalarApi: ScalarService, protected roomId: string) {
    }

    protected getWidgetsOfType(type: string, altType: string = null): Promise<Widget[]> {
        return this.scalarApi.getWidgets(this.roomId)
            .then(resp => ScalarToWidgets(resp))
            .then(widgets => {
                let filtered: Widget[] = [];

                for (let widget of widgets) {
                    if (widget.type === type || (altType && widget.type === altType))
                        filtered.push(widget);
                }

                return filtered;
            });
    }
}
