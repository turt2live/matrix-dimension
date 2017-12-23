import { EventEmitter } from "@angular/core";
import { convertScalarWidgetsToDtos, EditableWidget } from "../../shared/models/widget";
import { ToasterService } from "angular2-toaster";
import { ScalarClientApiService } from "../../shared/services/scalar-client-api.service";
import { ServiceLocator } from "../../shared/services/locator.service";
import { SessionStorage } from "../../shared/SessionStorage";

const SCALAR_WIDGET_LINKS = [
    "https://scalar-staging.riot.im/scalar/api/widgets/__TYPE__.html?url=",
    "https://scalar-staging.vector.im/scalar/api/widgets/__TYPE__.html?url=",
    "https://scalar-develop.riot.im/scalar/api/widgets/__TYPE__.html?url=",
    "https://demo.riot.im/scalar/api/widgets/__TYPE__.html?url=",
];

export class NewWidgetComponent {

    public isLoading = true;
    public isUpdating = false;
    public widgets: EditableWidget[];
    public newWidget: EditableWidget;
    public defaultExpandedWidgetId: string;

    private scalarWrapperUrls: string[] = [];
    private wrapperUrl = "";

    protected toaster = ServiceLocator.injector.get(ToasterService);
    private window = ServiceLocator.injector.get(Window);
    private scalarApi = ServiceLocator.injector.get(ScalarClientApiService);

    protected OnNewWidgetPrepared = new EventEmitter<EditableWidget>();
    protected OnWidgetsDiscovered = new EventEmitter<EditableWidget[]>();
    protected OnWidgetBeforeAdd = new EventEmitter<EditableWidget>();
    protected OnWidgetAfterAdd = new EventEmitter<EditableWidget>();
    protected OnWidgetPreparedForEdit = new EventEmitter<EditableWidget>();
    protected OnWidgetBeforeEdit = new EventEmitter<EditableWidget>();
    protected OnWidgetAfterEdit = new EventEmitter<EditableWidget>();
    protected OnWidgetBeforeDelete = new EventEmitter<EditableWidget>();
    protected OnWidgetAfterDelete = new EventEmitter<EditableWidget>();

    constructor(private widgetTypes: string[],
                public defaultName: string,
                private wrapperId = "generic",
                private scalarWrapperId = null) {
        this.isLoading = true;
        this.isUpdating = false;

        if (wrapperId) {
            this.wrapperUrl = this.window.location.origin + "/widgets/" + wrapperId + "?url=";

            if (!scalarWrapperId) scalarWrapperId = wrapperId;
            for (let widgetLink of SCALAR_WIDGET_LINKS) {
                this.scalarWrapperUrls.push(widgetLink.replace("__TYPE__", scalarWrapperId));
            }
        }

        this.prepareNewWidget();
        this.getWidgetsOfType(widgetTypes).then(widgets => {
            this.widgets = widgets;
            for (let widget of this.widgets) {
                this.unpackWidget(widget);
            }

            this.OnWidgetsDiscovered.emit(this.widgets);
            this.isLoading = false;
            this.isUpdating = false;

            // We reset after discovering to ensure that the widget component can correctly
            // set the state of the widget prior to us unpacking it (again)
            for (let widget of this.widgets) {
                this.resetWidget(widget);
            }

            // See if we should request editing a particular widget
            if (SessionStorage.editIntegrationId && SessionStorage.editsRequested === 1) {
                let editWidget: EditableWidget = null;
                let otherWidgets: EditableWidget[] = [];
                for (let widget of this.widgets) {
                    if (widget.id === SessionStorage.editIntegrationId) {
                        editWidget = widget;
                    } else otherWidgets.push(widget);
                }

                if (editWidget) {
                    console.log("Requesting edit for " + editWidget.id);
                    this.widgets = [editWidget];
                    otherWidgets.forEach(w => this.widgets.push(w));
                    this.defaultExpandedWidgetId = editWidget.id;
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
        widget.type = this.widgetTypes[0]; // always set the type to be the latest type

        // Populate our stuff
        widget.data["dimension:app:metadata"] = {
            inRoomId: SessionStorage.roomId,
            wrapperUrlBase: this.wrapperUrl,
            wrapperId: this.wrapperId,
            scalarWrapperId: this.scalarWrapperId,
            integration: {
                category: SessionStorage.editIntegration.category,
                type: SessionStorage.editIntegration.type,
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
            id: "dimension-" + this.widgetTypes[0] + "-" + (new Date().getTime()),
            type: this.widgetTypes[0],
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
        this.OnNewWidgetPrepared.emit(this.newWidget);
    }

    /**
     * Gets widgets from the Scalar API. The widgets returned from here are not unpacked and
     * may not have the Dimension-specific fields set.
     * @param {string[]} types The widget types to look for
     * @return {Promise<EditableWidget[]>} The widgets discovered
     */
    private getWidgetsOfType(types: string[]): Promise<EditableWidget[]> {
        return this.scalarApi.getWidgets(SessionStorage.roomId)
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
        if (!this.newWidget.dimension.newUrl || this.newWidget.dimension.newUrl.trim().length === 0) {
            this.toaster.pop("warning", "Please enter a URL for the widget");
            return;
        }

        this.packWidget(this.newWidget);

        this.isUpdating = true;
        this.OnWidgetBeforeAdd.emit(this.newWidget);
        return this.scalarApi.setWidget(SessionStorage.roomId, this.newWidget)
            .then(() => this.widgets.push(this.newWidget))
            .then(() => {
                this.isUpdating = false;
                this.OnWidgetAfterAdd.emit(this.newWidget);
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
        this.OnWidgetBeforeEdit.emit(widget);
        return this.scalarApi.setWidget(SessionStorage.roomId, widget)
            .then(() => {
                this.isUpdating = false;
                this.OnWidgetAfterEdit.emit(widget);
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
        this.OnWidgetBeforeDelete.emit(widget);
        return this.scalarApi.deleteWidget(SessionStorage.roomId, widget)
            .then(() => this.widgets.splice(this.widgets.indexOf(widget), 1))
            .then(() => {
                this.isUpdating = false;
                this.OnWidgetAfterDelete.emit(widget);
                this.toaster.pop("success", "Widget deleted!");
            })
            .catch(err => {
                this.isUpdating = false;
                console.error(err);
                this.toaster.pop("error", err.json().error);
            });
    }

    /**
     * Resets a widget to before it had changes made to it
     * @param {EditableWidget} widget The widget to reset
     */
    public resetWidget(widget: EditableWidget) {
        this.unpackWidget(widget);
        this.OnWidgetPreparedForEdit.emit(widget);
    }
}