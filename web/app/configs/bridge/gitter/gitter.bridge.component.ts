import { Component } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { FE_GitterLink } from "../../../shared/models/gitter";
import { GitterApiService } from "../../../shared/services/integrations/gitter-api.service";
import { ScalarClientApiService } from "../../../shared/services/scalar/scalar-client-api.service";

interface GitterConfig {
    botUserId: string;
    link: FE_GitterLink;
}

@Component({
    templateUrl: "gitter.bridge.component.html",
    styleUrls: ["gitter.bridge.component.scss"],
})
export class GitterBridgeConfigComponent extends BridgeComponent<GitterConfig> {

    public gitterRoomName: string;
    public isBusy: boolean;

    constructor(private gitter: GitterApiService, private scalar: ScalarClientApiService) {
        super("gitter");
    }

    public get isBridged(): boolean {
        return this.bridge.config.link && !!this.bridge.config.link.gitterRoomName;
    }

    public async bridgeRoom(): Promise<any> {
        this.isBusy = true;

        try {
            await this.scalar.inviteUser(this.roomId, this.bridge.config.botUserId);
        } catch (e) {
            if (!e.response || !e.response.error || !e.response.error._error ||
                e.response.error._error.message.indexOf("already in the room") === -1) {
                this.isBusy = false;
                this.toaster.pop("error", "Error inviting bridge");
                return;
            }
        }

        this.gitter.bridgeRoom(this.roomId, this.gitterRoomName).then(link => {
            this.bridge.config.link = link;
            this.isBusy = false;
            this.toaster.pop("success", "Bridge requested");
        }).catch(error => {
            this.isBusy = false;
            console.error(error);
            this.toaster.pop("error", "Error requesting bridge");
        });
    }

    public unbridgeRoom(): void {
        this.isBusy = true;
        this.gitter.unbridgeRoom(this.roomId).then(() => {
            this.bridge.config.link = null;
            this.isBusy = false;
            this.toaster.pop("success", "Bridge removed");
        }).catch(error => {
            this.isBusy = false;
            console.error(error);
            this.toaster.pop("error", "Error removing bridge");
        });
    }
}