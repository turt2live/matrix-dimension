import { Component } from "@angular/core";

@Component({
    templateUrl: "./irc.component.html",
    styleUrls: ["./irc.component.scss"],
})
export class AdminIrcBridgeComponent {

    public isLoading = true;
    public hasModularBridge = false;
    public configurations: any[] = [];

    constructor() {
    }

    public getEnabledNetworksString(bridge: any): string {
        return "TODO: " + bridge;
    }

    public addModularHostedBridge() {

    }

    public addSelfHostedBridge() {

    }

    public editNetworks(bridge: any) {
        console.log(bridge);
    }
}
