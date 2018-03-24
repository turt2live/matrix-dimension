import { WidgetComponent } from "../widget.component";
import { WIDGET_GOOGLE_DOCS } from "../../../shared/models/widget";
import { Component } from "@angular/core";

@Component({
    templateUrl: "gdoc.widget.component.html",
    styleUrls: ["gdoc.widget.component.scss"],
})
export class GoogleDocsWidgetConfigComponent extends WidgetComponent {
    constructor() {
        super(WIDGET_GOOGLE_DOCS, "Google Doc", "generic", "googleDocs");
    }
}