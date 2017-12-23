import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "my-ibox",
    templateUrl: "./ibox.component.html",
    styleUrls: ["./ibox.component.scss"],
})
export class IboxComponent implements OnInit {
    @Input() title: string;
    @Input() isCollapsible: boolean;
    @Input() defaultCollapsed: boolean;

    public collapsed = false;

    public ngOnInit(): void {
        this.collapsed = this.defaultCollapsed;
    }
}
