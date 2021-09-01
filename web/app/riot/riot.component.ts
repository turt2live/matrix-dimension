import { Component } from "@angular/core";
import { SessionStorage } from "../shared/SessionStorage";

@Component({
    selector: "app-riot",
    templateUrl: "./riot.component.html",
    styleUrls: ["./riot.component.scss"],
})
export class RiotComponent {
    constructor() {}

    public isAdmin(): boolean {
        return SessionStorage.isAdmin;
    }
}
