import { ScalarService } from "../../shared/services/scalar.service";
import { convertScalarWidgetsToDtos, EditableWidget } from "../../shared/models/widget";
import { ToasterService } from "angular2-toaster";
import { Integration } from "../../shared/models/integration";

const SCALAR_WIDGET_LINKS = [
    "https://scalar-staging.riot.im/scalar/api/widgets/__TYPE__.html?url=",
    "https://scalar-staging.vector.im/scalar/api/widgets/__TYPE__.html?url=",
    "https://scalar-develop.riot.im/scalar/api/widgets/__TYPE__.html?url=",
    "https://demo.riot.im/scalar/api/widgets/__TYPE__.html?url=",
];

export class WidgetComponent {

    public isLoading = true;
    public isUpdating = false;
    public widgets: EditableWidget[];
    public newWidget: EditableWidget;

    private toggledWidgetIds: string[] = [];
    private scalarWrapperUrls: string[] = [];
    private wrapperUrl = "";

    constructor(window: Window,
                protected toaster: ToasterService,
                protected scalarApi: ScalarService,
                public roomId: string,
                public integration: Integration,
                editWidgetId: string,
                private widgetIds: string[],
                private defaultName: string,
                private wrapperId = "generic",
                private scalarWrapperId = null) {
        this.isLoading = true;
        this.isUpdating = false;

        if (wrapperId) {
            this.wrapperUrl = window.location.origin + "/widgets/" + wrapperId + "?url=";

            if (!scalarWrapperId) scalarWrapperId = wrapperId;
            for (let widgetLink of SCALAR_WIDGET_LINKS) {
                this.scalarWrapperUrls.push(widgetLink.replace("__TYPE__", scalarWrapperId));
            }
        }

        this.prepareNewWidget();
        this.getWidgetsOfType(widgetIds).then(widgets => {
            this.widgets = widgets;
            for (let widget of this.widgets) {
                this.unpackWidget(widget);
            }

            this.onWidgetsDiscovered();
            this.isLoading = false;
            this.isUpdating = false;

            // See if we should request editing a particular widget
            if (editWidgetId) {
                for (let widget of this.widgets) {
                    if (widget.id === editWidgetId) {
                        console.log("Requesting edit for " + widget.id);
                        this.editWidget(widget);
                    }
                }
            }
        });
    }

    /**
     * Populates the Dimension-specific fields of the widget, overwriting any values that
     * were there previously.
     * @param {EditableWidget} widget The widget to unpack.
     */
    private unpackWidget(widget: EditableWidget) {
        widget.dimension = {
            newUrl: this.unwrapUrl(widget.url),
            newName: widget.name,
            newTitle: widget.data ? widget.data.title : null,
            newData: JSON.parse(JSON.stringify(widget.data || "{}")),
        };
    }

    /**
     * Packs a widget, converting the Dimension-specific parameters into a widget. This will
     * overwrite any values in the widget which need to be committed to from the Dimension
     * fields.
     * @param {EditableWidget} widget The widget to pack.
     */
    private packWidget(widget: EditableWidget) {
        // The widget already has an ID and type, we just need to fill in the bits
        widget.name = widget.dimension.newName || this.defaultName;
        widget.data = widget.dimension.newData || {};
        widget.url = this.wrapUrl(widget.dimension.newUrl, Object.keys(widget.data).map(k => "$" + k));
        widget.type = this.widgetIds[0]; // always set the type to be the latest type

        // Populate our stuff
        widget.data["dimension:app:metadata"] = {
            inRoomId: this.roomId,
            wrapperUrlBase: this.wrapperUrl,
            wrapperId: this.wrapperId,
            scalarWrapperId: this.scalarWrapperId,
            integration: {
                type: this.integration.type,
                integrationType: this.integration.integrationType,
            },
            lastUpdatedTs: new Date().getTime(),
        };

        // Set the title to an appropriate value. Empty strings are valid titles, but other falsey
        // values should be considered as "no title".
        if (widget.dimension.newTitle || widget.dimension.newTitle === "")
            widget.data["title"] = widget.dimension.newTitle;
        else widget.data["title"] = undefined;
    }

    /**
     * Builds a new widget and assigns it to the newWidget property. This also expands the
     * Dimension-specific fields for the widget with reasonable defaults.
     */
    protected prepareNewWidget() {
        this.newWidget = <EditableWidget>{
            id: "dimension-" + this.widgetIds[0] + "-" + (new Date().getTime()),
            type: this.widgetIds[0],
            name: this.defaultName,
            url: window.location.origin,
            //ownerId: this.userId, // we don't have a user id
            dimension: {
                newUrl: "",
                newName: "",
                newTitle: null, // by default we don't offer a title (empty strings are valid titles)
                newData: {},
            },
        };
        this.onNewWidgetPrepared();
    }

    /**
     * Gets widgets from the Scalar API. The widgets returned from here are not unpacked and
     * may not have the Dimension-specific fields set.
     * @param {string[]} types The widget types to look for
     * @return {Promise<EditableWidget[]>} The widgets discovered
     */
    private getWidgetsOfType(types: string[]): Promise<EditableWidget[]> {
        return this.scalarApi.getWidgets(this.roomId)
            .then(resp => convertScalarWidgetsToDtos(resp))
            .then(widgets => widgets.filter(w => types.indexOf(w.type) !== -1));
    }

    /**
     * Gets the actual URL from known wrappers. If the URL is found to be not wrapped, or no
     * wrappers are applicable, then the given URL is returned.
     * @param {string} url The URL to unwrap
     * @return {string} The unwrapped URL
     */
    private unwrapUrl(url: string): string {
        console.log(this.scalarWrapperUrls);
        if (!this.wrapperUrl) return url;

        const urls = [this.wrapperUrl].concat(this.scalarWrapperUrls);
        for (let scalarUrl of urls) {
            if (url.startsWith(scalarUrl)) {
                return decodeURIComponent(url.substring(scalarUrl.length));
            }
        }

        return url;
    }

    /**
     * Wraps the URL with an appropriate wrapper. If no wrapper is defined for this component
     * then the given URL is returned.
     * @param {string} url The URL to wrap
     * @param {string[]} customVars The values in the URL which should not be encoded
     * @return {string} The wrapped URL
     */
    private wrapUrl(url: string, customVars: string[]): string {
        if (!this.wrapperUrl) return url;

        let encodedURL = this.wrapperUrl + encodeURIComponent(url);
        encodedURL = this.decodeParams(encodedURL, customVars);

        return encodedURL;
    }

    /**
     * Decodes the given URL to make the parameters safe for interpretation by clients. The variables
     * specified in the widget spec will be decoded automatically.
     * @param {string} encodedURL The encoded URL
     * @param {string[]} customVars The custom variables to decode
     * @returns {string} The URL with variables decoded accordingly
     */
    protected decodeParams(encodedURL: string, customVars: string[]): string {
        encodedURL = encodedURL.replace(encodeURIComponent("$matrix_user_id"), "$matrix_user_id");
        encodedURL = encodedURL.replace(encodeURIComponent("$matrix_room_id"), "$matrix_room_id");
        encodedURL = encodedURL.replace(encodeURIComponent("$matrix_display_name"), "$matrix_display_name");
        encodedURL = encodedURL.replace(encodeURIComponent("$matrix_avatar_url"), "$matrix_avatar_url");
        for (const key of customVars) {
            encodedURL = encodedURL.replace(encodeURIComponent(key), key);
        }

        return encodedURL;
    }

    /**
     * Adds the widget stored in newWidget to the room.
     * @returns {Promise<*>} Resolves when the widget has been added and newWidget is populated
     * with a new widget.
     */
    public addWidget(): Promise<any> {
        this.packWidget(this.newWidget);

        this.isUpdating = true;
        this.onWidgetBeforeAdd();
        return this.scalarApi.setWidget(this.roomId, this.newWidget)
            .then(() => this.widgets.push(this.newWidget))
            .then(() => {
                this.isUpdating = false;
                this.onWidgetAfterAdd();
                this.prepareNewWidget();
                this.toaster.pop("success", "Widget added!");
            })
            .catch(err => {
                this.isUpdating = false;
                console.error(err);
                this.toaster.pop("error", err.json().error);
            });
    }

    /**
     * Saves a widget, persisting the changes to the room.
     * @param {EditableWidget} widget The widget to save.
     * @returns {Promise<any>} Resolves when the widget has been updated in the room.
     */
    public saveWidget(widget: EditableWidget): Promise<any> {
        if (!widget.dimension.newUrl || widget.dimension.newUrl.trim().length === 0) {
            this.toaster.pop("warning", "Please enter a URL for the widget");
            return;
        }

        this.packWidget(widget);

        this.isUpdating = true;
        this.onWidgetBeforeEdit(widget);
        return this.scalarApi.setWidget(this.roomId, widget)
            .then(() => this.toggleWidget(widget))
            .then(() => {
                this.isUpdating = false;
                this.onWidgetAfterEdit(widget);
                this.toaster.pop("success", "Widget updated!");
            })
            .catch(err => {
                this.isUpdating = false;
                console.error(err);
                this.toaster.pop("error", err.json().error);
            });
    }

    /**
     * Removes a widget from the room
     * @param {EditableWidget} widget The widget to remove
     * @returns {Promise<*>} Resolves when the widget has been removed.
     */
    public removeWidget(widget: EditableWidget): Promise<any> {
        this.isUpdating = true;
        this.onWidgetBeforeDelete(widget);
        return this.scalarApi.deleteWidget(this.roomId, widget)
            .then(() => this.widgets.splice(this.widgets.indexOf(widget), 1))
            .then(() => {
                this.isUpdating = false;
                this.onWidgetAfterDelete(widget);
                this.toaster.pop("success", "Widget deleted!");
            })
            .catch(err => {
                this.isUpdating = false;
                console.error(err);
                this.toaster.pop("error", err.json().error);
            });
    }

    /**
     * Puts a widget in the edit state.
     * @param {EditableWidget} widget
     */
    public editWidget(widget: EditableWidget) {
        this.toggleWidget(widget, "edit");
    }

    /**
     * Toggles a widget between the "edit" and "canceled" state. If a targetState is
     * defined, the widget is forced into that state.
     * @param {EditableWidget} widget The widget to set the state of.
     * @param {"edit"|"cancel"|null} targetState The target state, optional
     */
    public toggleWidget(widget: EditableWidget, targetState: "edit" | "cancel" | null = null) {
        let idx = this.toggledWidgetIds.indexOf(widget.id);
        if (targetState === null) targetState = idx === -1 ? "edit" : "cancel";

        if (targetState === "edit") {
            this.unpackWidget(widget);
            this.onWidgetPreparedForEdit(widget);

            if (idx === -1) this.toggledWidgetIds.push(widget.id);
        }
        else this.toggledWidgetIds.splice(idx, 1);
    }

    /**
     * Determines if a widget is in the edit state
     * @param {EditableWidget} widget The widget to check
     * @returns {boolean} true if the widget is in the edit state
     */
    public isWidgetToggled(widget: EditableWidget) {
        return this.toggledWidgetIds.indexOf(widget.id) !== -1;
    }

    // Component hooks below here
    // ------------------------------------------------------------------

    /**
     * Called when a new widget has been created in the newWidget field
     */
    protected onNewWidgetPrepared(): void {
        // Component hook
    }

    /**
     * Called after all the widgets have been discovered and unpacked for the room.
     */
    protected onWidgetsDiscovered(): void {
        // Component hook
    }

    /**
     * Called before the widget is added to the room, but after the Dimension-specific
     * settings have been copied over to the primary fields.
     */
    protected onWidgetBeforeAdd(): void {
        // Component hook
    }

    /**
     * Called after the widget has been added to the room, but before the newWidget field
     * has been set to a new widget.
     */
    protected onWidgetAfterAdd(): void {
        // Component hook
    }

    /**
     * Called when the given widget has been asked to be prepared for editing. At this point
     * the widget is not being persisted to the room, it is just updating the EditingWidget's
     * properties for the user's ability to edit it.
     * @param {EditableWidget} _widget The widget that has been prepared for editing
     */
    protected onWidgetPreparedForEdit(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called before the given widget has been updated in the room, but after the
     * Dimension-specific settings have been copied over to the primary fields.
     * This is not called for widgets being deleted.
     * @param {EditableWidget} _widget The widget about to be edited
     */
    protected onWidgetBeforeEdit(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called after a given widget has been updated in the room. This is not called for
     * widgets being deleted.
     * @param {EditableWidget} _widget The widget that has been updated.
     */
    protected onWidgetAfterEdit(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called before the given widget has been removed from the room. No changes to the
     * widget have been made at this point.
     * @param {EditableWidget} _widget The widget about to be deleted.
     */
    protected onWidgetBeforeDelete(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called after a given widget has been deleted from the room. The widget will be in
     * the deleted state and will no longer be tracked anywhere on the component.
     * @param {EditableWidget} _widget The widget that has been deleted.
     */
    protected onWidgetAfterDelete(_widget: EditableWidget): void {
        // Component hook
    }
}
