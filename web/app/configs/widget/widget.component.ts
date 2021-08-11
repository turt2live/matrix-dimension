import { convertScalarWidgetsToDtos, EditableWidget } from "../../shared/models/widget";
import { ToasterService } from "angular2-toaster";
import { ScalarClientApiService } from "../../shared/services/scalar/scalar-client-api.service";
import { ServiceLocator } from "../../shared/registry/locator.service";
import { SessionStorage } from "../../shared/SessionStorage";
import { TranslateService } from "@ngx-translate/core";
import { Inject, Injectable, OnInit } from "@angular/core";

const SCALAR_WIDGET_LINKS = [
    "https://scalar-staging.riot.im/scalar/api/widgets/__TYPE__.html?__PNAME__=",
    "https://scalar-staging.vector.im/scalar/api/widgets/__TYPE__.html?__PNAME__=",
    "https://scalar-develop.riot.im/scalar/api/widgets/__TYPE__.html?__PNAME__=",
    "https://demo.riot.im/scalar/api/widgets/__TYPE__.html?__PNAME__=",
    "https://scalar.vector.im/scalar/api/widgets/__TYPE__.html?__PNAME__=",
];

export const DISABLE_AUTOMATIC_WRAPPING = "";

@Injectable()
export class WidgetComponent implements OnInit {

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

    constructor(@Inject(String) private widgetTypes: string[],
                @Inject(String) public defaultName: string,
                @Inject(String) private wrapperId = "generic",
                public translate: TranslateService,
                @Inject(String) private scalarWrapperId = null,
                @Inject(String) private scalarWrapperUrlParamName = "url") {
        this.translate = translate;

        this.isLoading = true;
        this.isUpdating = false;
    }

    public ngOnInit(): void {
        if (this.wrapperId) {
            this.wrapperUrl = this.window.location.origin + "/widgets/" + this.wrapperId + "?url=";

            if (!this.scalarWrapperId) this.scalarWrapperId = this.wrapperId;
            for (let widgetLink of SCALAR_WIDGET_LINKS) {
                const wrapperLink = widgetLink
                    .replace("__TYPE__", this.scalarWrapperId)
                    .replace("__PNAME__", this.scalarWrapperUrlParamName);
                this.scalarWrapperUrls.push(wrapperLink);
            }
        }

        this.prepareNewWidget();
        this.getWidgetsOfType(this.widgetTypes).then(widgets => {
            this.widgets = widgets;
            for (let widget of this.widgets) {
                this.unpackWidget(widget);
            }

            this.OnWidgetsDiscovered(this.widgets);
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
        widget.data.url = widget.dimension.newUrl;
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
            ownerId: SessionStorage.userId,
            dimension: {
                newUrl: "",
                newName: "",
                newTitle: null, // by default we don't offer a title (empty strings are valid titles)
                newData: {},
            },
        };
        console.log("Emitting new widget prepared event");
        this.OnNewWidgetPrepared(this.newWidget);
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
     * Performs the templating calculation on a URL as best as it can. Variables that cannot be converted
     * will be left unchanged, such as the $matrix_display_name and $matrix_avatar_url. This is intended to
     * be used for Scalar compatibility operations.
     * @param {string} urlTemplate The URL with variables to template
     * @param {*} data The data to consider while templating
     * @returns {string} The URL with the variables replaced
     */
    protected templateUrl(urlTemplate: string, data: any): string {
        let result = urlTemplate;

        result = result.replace("$matrix_room_id", SessionStorage.roomId);
        result = result.replace("$matrix_user_id", SessionStorage.userId);
        // result = result.replace("$matrix_display_name", "NOT SUPPORTED");
        // result = result.replace("$matrix_avatar_url", "NOT SUPPORTED");

        for (const key of Object.keys(data)) {
            result = result.replace("$" + key, data[key]);
        }

        return result;
    }

    /**
     * Adds the widget stored in newWidget to the room.
     * @returns {Promise<*>} Resolves when the widget has been added and newWidget is populated
     * with a new widget.
     */
    public addWidget(): Promise<any> {
        // Make sure we call "before add" before validating the URL
        try {
            this.OnWidgetBeforeAdd(this.newWidget);
        } catch (error) {
            this.translate.get(error.message).subscribe((res: string) => {this.toaster.pop("warning", res); });
            return;
        }

        if (!this.newWidget.dimension.newUrl || this.newWidget.dimension.newUrl.trim().length === 0) {
           this.translate.get("Please enter a URL for the widget").subscribe((res: string) => {this.toaster.pop("warning", res ); });
            return;
        }

        this.packWidget(this.newWidget);

        this.isUpdating = true;
        return this.scalarApi.setWidget(SessionStorage.roomId, this.newWidget)
            .then(() => this.widgets.push(this.newWidget))
            .then(() => {
                this.isUpdating = false;
                this.OnWidgetAfterAdd(this.newWidget);
                this.prepareNewWidget();
                this.translate.get("Widget added!").subscribe((res: string) => {this.toaster.pop("success", res); });
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
        // Make sure we call "before add" before validating the URL
        try {
            this.OnWidgetBeforeEdit(widget);
        } catch (error) {
            this.toaster.pop("warning", error.message);
            return;
        }

        if (!widget.dimension.newUrl || widget.dimension.newUrl.trim().length === 0) {
            this.translate.get("Please enter a URL for the widget").subscribe((res: string) => {this.toaster.pop("warning", res); });
            return;
        }

        this.packWidget(widget);

        this.isUpdating = true;
        return this.scalarApi.setWidget(SessionStorage.roomId, widget)
            .then(() => {
                this.isUpdating = false;
                this.OnWidgetAfterEdit(widget);
                this.translate.get("Widget updated!").subscribe((res: string) => {this.toaster.pop("success", res); });
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
        this.OnWidgetBeforeDelete(widget);
        return this.scalarApi.deleteWidget(SessionStorage.roomId, widget)
            .then(() => this.widgets.splice(this.widgets.indexOf(widget), 1))
            .then(() => {
                this.isUpdating = false;
                this.OnWidgetAfterDelete(widget);
                this.translate.get("Widget deleted!").subscribe((res: string) => {this.toaster.pop("success", res); });
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
        this.OnWidgetPreparedForEdit(widget);
    }

    // Component hooks below here
    // ------------------------------------------------------------------

    /**
     * Called when a new widget has been created in the newWidget field
     * @param {EditableWidget} _widget The widget that has been prepared
     */
    protected OnNewWidgetPrepared(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called after all the widgets have been discovered and unpacked for the room.
     * @param {EditableWidget[]} _widgets The widgets that were discovered
     */
    protected OnWidgetsDiscovered(_widgets: EditableWidget[]): void {
        // Component hook
    }

    /**
     * Called before the widget is added to the room, and before the Dimension properties
     * have been copied over. This is a good time to do validation.
     * @param {EditableWidget} _widget The widget that is about to be added
     */
    protected OnWidgetBeforeAdd(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called after the widget has been added to the room, but before the newWidget field
     * has been set to a new widget.
     * @param {EditableWidget} _widget The widget that has been added.
     */
    protected OnWidgetAfterAdd(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called when the given widget has been asked to be prepared for editing. At this point
     * the widget is not being persisted to the room, it is just updating the EditingWidget's
     * properties for the user's ability to edit it.
     * @param {EditableWidget} _widget The widget that has been prepared for editing
     */
    protected OnWidgetPreparedForEdit(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called before the given widget has been updated in the room, and before the Dimension
     * properties have been copied over. This is a good time to do validation.
     * This is not called for widgets being deleted.
     * @param {EditableWidget} _widget The widget about to be edited
     */
    protected OnWidgetBeforeEdit(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called after a given widget has been updated in the room. This is not called for
     * widgets being deleted.
     * @param {EditableWidget} _widget The widget that has been updated.
     */
    protected OnWidgetAfterEdit(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called before the given widget has been removed from the room. No changes to the
     * widget have been made at this point.
     * @param {EditableWidget} _widget The widget about to be deleted.
     */
    protected OnWidgetBeforeDelete(_widget: EditableWidget): void {
        // Component hook
    }

    /**
     * Called after a given widget has been deleted from the room. The widget will be in
     * the deleted state and will no longer be tracked anywhere on the component.
     * @param {EditableWidget} _widget The widget that has been deleted.
     */
    protected OnWidgetAfterDelete(_widget: EditableWidget): void {
        // Component hook
    }
}
