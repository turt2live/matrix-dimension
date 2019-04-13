import { Component, Input, OnInit } from "@angular/core";
import { ANIMATION_FADE_IN_NOT_OUT } from "../../app.animations";

@Component({
    selector: "my-ibox",
    templateUrl: "./ibox.component.html",
    styleUrls: ["./ibox.component.scss"],
    animations: [ANIMATION_FADE_IN_NOT_OUT],
})
export class IboxComponent implements OnInit {
    @Input() boxTitle: string;
    @Input() isCollapsible: boolean;
    @Input() defaultCollapsed: boolean;

    public collapsed = false;

    public ngOnInit(): void {
        this.collapsed = this.defaultCollapsed;
    }
}
