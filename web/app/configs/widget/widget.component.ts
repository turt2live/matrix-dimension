import { ScalarService } from "../../shared/scalar.service";
import { Widget, ScalarToWidgets } from "../../shared/models/widget";

export const SCALAR_WIDGET_LINKS = [
    "https://scalar-staging.riot.im/scalar/api/widgets/generic.html?url=",
    "https://scalar-staging.vector.im/scalar/api/widgets/generic.html?url=",
    "https://scalar-develop.riot.im/scalar/api/widgets/generic.html?url=",
    "https://demo.riot.im/scalar/api/widgets/generic.html?url=",
];

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
