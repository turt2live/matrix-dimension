import { FE_SimpleBot } from "../models/integration";
import { ScalarClientApiService } from "../services/scalar/scalar-client-api.service";
import { ToasterService } from "angular2-toaster";
import { TranslateService } from "@ngx-translate/core";
import { IntegrationsApiService } from "../services/integrations/integrations-api.service";

export class SimpleBotController {
    constructor(
        public readonly bot: FE_SimpleBot,
        private scalar: ScalarClientApiService,
        private integrationsApi: IntegrationsApiService,
        private toaster: ToasterService,
        private translate: TranslateService,
    ) {
    }

    public async toggle(roomId: string): Promise<void> {
        let prom1: Promise<any>;
        if (!this.bot._inRoom) {
            prom1 = this.scalar.inviteUser(roomId, this.bot.userId);
        } else {
            prom1 = this.integrationsApi.removeIntegration(this.bot.category, this.bot.type, roomId);
        }

        this.bot._inRoom = !this.bot._inRoom;
        this.bot._isUpdating = true;
        try {
            await prom1;
            this.bot._isUpdating = false;
            if (this.bot._inRoom) {
                this.translate.get('was invited to the room').subscribe((res: string) => {
                    this.toaster.pop("success", this.bot.displayName + res);
                });
            } else {
                this.translate.get('was removed from the room').subscribe((res: string) => {
                    this.toaster.pop("success", this.bot.displayName + res);
                });
            }
        } catch (err) {
            this.bot._inRoom = !this.bot._inRoom; // revert the status change
            this.bot._isUpdating = false;
            console.error(err);

            let errorMessage = null;
            if (err.json) errorMessage = err.json().error;
            if (err.response && err.response.error) errorMessage = err.response.error.message;
            if (!errorMessage) errorMessage = "";
            this.translate.get('Could not update integration status: ').subscribe((res: string) => {
                this.toaster.pop("error", res + errorMessage);
            });
        }
    }
}
