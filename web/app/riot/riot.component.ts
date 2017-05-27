import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../shared/api.service";
import { Bot } from "../shared/models/bot";
import { ScalarService } from "../shared/scalar.service";
import { ToasterService } from "angular2-toaster";

@Component({
    selector: 'my-riot',
    templateUrl: './riot.component.html',
    styleUrls: ['./riot.component.scss'],
})
export class RiotComponent {

    public error: string;
    public bots: Bot[] = [];
    public loading = true;
    public roomId: string;

    private scalarToken: string;

    constructor(private activatedRoute: ActivatedRoute,
                private api: ApiService,
                private scalar: ScalarService,
                private toaster: ToasterService) {
        let params: any = this.activatedRoute.snapshot.queryParams;
        if (!params.scalar_token || !params.room_id) this.error = "Missing scalar token or room ID";
        else {
            this.roomId = params.room_id;
            this.scalarToken = params.scalar_token;

            this.api.checkScalarToken(params.scalar_token).then(isValid => {
                if (isValid) this.init();
                else this.error = "Invalid scalar token";
            }).catch(err => {
                this.error = "Unable to communicate with Dimension";
                console.error(err);
            });
        }
    }

    private init() {
        this.api.getBots().then(bots => {
            this.bots = bots;
            let promises = bots.map(b => this.updateBotState(b));
            return Promise.all(promises);
        }).then(() => this.loading = false);
    }

    private updateBotState(bot: Bot) {
        return this.scalar.getMembershipState(this.roomId, bot.mxid).then(payload => {
            bot.isBroken = false;

            if (!payload.response) {
                bot.isEnabled = false;
                return;
            }

            bot.isEnabled = (payload.response.membership === 'join' || payload.response.membership === 'invite');
        }, (error) => {
            console.error(error);
            bot.isEnabled = false;
            bot.isBroken = true;
        });
    }

    public updateBot(bot: Bot) {
        let promise = null;

        if (!bot.isEnabled) {
            promise = this.api.kickUser(this.roomId, bot.mxid, this.scalarToken);
        } else promise = this.scalar.inviteUser(this.roomId, bot.mxid);

        promise
            .then(() => this.toaster.pop("success", bot.name + " invited to the room"))
            .catch(err => {
                let errorMessage = "Could not update bot status";

                if (err.json) {
                    errorMessage = err.json().error;
                } else errorMessage = err.response.error.message;

                bot.isEnabled = !bot.isEnabled;
                this.toaster.pop("error", errorMessage);
            });
    }
}
