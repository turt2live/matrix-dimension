import { DISABLE_AUTOMATIC_WRAPPING, WidgetComponent } from "../widget.component";
import { EditableWidget, WIDGET_SPOTIFY } from "../../../shared/models/widget";
import { Component } from "@angular/core";

@Component({
    templateUrl: "spotify.widget.component.html",
    styleUrls: ["spotify.widget.component.scss"],
})
export class SpotifyWidgetConfigComponent extends WidgetComponent {

    constructor() {
        super(WIDGET_SPOTIFY, "Spotify", DISABLE_AUTOMATIC_WRAPPING, "spotify");
    }

    protected OnNewWidgetPrepared(widget: EditableWidget): void {
        widget.dimension.newData.uri = "";
    }

    protected OnWidgetBeforeAdd(widget: EditableWidget): void {
        this.setSpotifyUrl(widget);
    }

    protected OnWidgetBeforeEdit(widget: EditableWidget) {
        this.setSpotifyUrl(widget);
    }

    private setSpotifyUrl(widget: EditableWidget) {
        widget.dimension.newUrl = window.location.origin + "/widgets/spotify?uri=$uri";
    }
}