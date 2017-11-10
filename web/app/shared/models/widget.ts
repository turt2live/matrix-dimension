import { WidgetsResponse } from "./scalar_responses";

// Scalar's widget types (known)
export const WIDGET_SCALAR_CUSTOM = "customwidget";
export const WIDGET_SCALAR_ETHERPAD = "etherpad";
export const WIDGET_SCALAR_GOOGLEDOCS = "googledocs";
export const WIDGET_SCALAR_JITSI = "jitsi";
export const WIDGET_SCALAR_YOUTUBE = "youtube";
export const WIDGET_SCALAR_GRAFANA = "grafana";
//Placeholder until Scalar supports twitch
export const WIDGET_SCALAR_TWITCH = "";

// Dimension has its own set of types to ensure that we don't conflict with Scalar
export const WIDGET_DIM_CUSTOM = "dimension-customwidget";
export const WIDGET_DIM_YOUTUBE = "dimension-youtube";
export const WIDGET_DIM_TWITCH = "dimension-twitch";

export interface Widget {
    id: string;
    type: string;
    url: string;
    name?: string;
    data?: any;
    ownerId?: string;

    // used only in ui
    newName?: string;
    newUrl?: string;
}

export function ScalarToWidgets(scalarResponse: WidgetsResponse): Widget[] {
    let widgets = [];

    for (let event of scalarResponse.response) {
        widgets.push({
            id: event.state_key,
            type: event.content.type,
            url: event.content.url,
            name: event.content.name,
            data: event.content.data,
            ownerId: event.sender,
        });
    }

    return widgets;
}
