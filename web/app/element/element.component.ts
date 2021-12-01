import { Component } from "@angular/core";
import { SessionStorage } from "../shared/SessionStorage";

@Component({
    selector: "my-element",
    templateUrl: "./element.component.html",
    styleUrls: ["./element.component.scss"],
})
export class ElementComponent {
    constructor() {}

    public isAdmin(): boolean {
        return SessionStorage.isAdmin;
    }
}
