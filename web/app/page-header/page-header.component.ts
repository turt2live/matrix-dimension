import { Component, Input } from "@angular/core";

@Component({
    selector: "my-page-header",
    templateUrl: "./page-header.component.html",
    styleUrls: ["./page-header.component.scss"],
})
export class PageHeaderComponent {
    @Input() pageName: string;
}
