import { WidgetsResponse } from "./server-client-responses";

export const WIDGET_CUSTOM = ["customwidget", "dimension-customwidget"];
export const WIDGET_ETHERPAD = ["etherpad", "dimension-etherpad"];
export const WIDGET_GOOGLE_DOCS = ["googledocs", "dimension-googledocs"];
export const WIDGET_GOOGLE_CALENDAR = ["googlecalendar", "dimension-googlecalendar"];
export const WIDGET_JITSI = ["jitsi", "dimension-jitsi"];
export const WIDGET_YOUTUBE = ["youtube", "dimension-youtube"];
export const WIDGET_GRAFANA = ["grafana", "dimension-grafana"];
export const WIDGET_TWITCH = ["twitch", "dimension-twitch"];
export const WIDGET_STICKER_PICKER = ["m.stickerpicker"];
export const WIDGET_TRADINGVIEW = ["tradingview", "dimension-tradingview"];
export const WIDGET_SPOTIFY = ["spotify", "dimension-spotify"];

export interface EditableWidget {
    /**
     * The widget ID. This is generated.
     */
    id: string;

    /**
     * The type of widget. Normally one of the WIDGET_* values.
     */
    type: string;

    /**
     * The wrapped URL for the widget.
     */
    url: string;

    /**
     * The name of the widget.
     */
    name?: string;

    /**
     * The raw data for the widget. For parsed data, refer to the "dimension" property.
     */
    data?: any;

    /**
     * The user ID that created this widget.
     */
    ownerId?: string;

    /**
     * The Dimension-related settings for the widget, such as the metadata and state
     * information for editing/creating this widget.
     */
    dimension?: {
        /**
         * The new name for the widget. Used when editing/creating the widget.
         */
        newName: string;

        /**
         * The new title for the widget. This may be null to have the client try and
         * determine a title for this widget. An empty string will prevent the client
         * from determining a title. Used when editing or creating the widget.
         */
        newTitle: string;

        /**
         * The new URL for the widget (may end up being wrapped). Used when editing or
         * creating the widget.
         */
        newUrl: string;

        /**
         * The new data for the widget. Should not be falsey, but may be empty. Used
         * when editing/creating the widget.
         */
        newData: any;
    };
}

/**
 * Converts a series of widgets (as given to us by the Scalar API) to widgets which
 * can be passed around safely. This only converts the properties to the Widget interface
 * and will not populate any custom fields, including the "dimension" field.
 * @param {WidgetsResponse} scalarResponse The scalar widgets
 * @return {EditableWidget[]} The Dimension widgets
 */
export function convertScalarWidgetsToDtos(scalarResponse: WidgetsResponse): EditableWidget[] {
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
