import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../shared/api.service";
import { Bot } from "../shared/models/bot";

@Component({
    selector: 'my-riot',
    templateUrl: './riot.component.html',
    styleUrls: ['./riot.component.scss'],
})
export class RiotComponent {

    public error: string;
    public bots: Bot[] = [];

    constructor(private activatedRoute: ActivatedRoute, private api: ApiService) {
        let params: any = this.activatedRoute.snapshot.queryParams;
        if (!params.scalar_token || !params.room_id) this.error = "Missing scalar token or room ID";
        else this.api.checkScalarToken(params.scalar_token).then(isValid => {
            if (isValid) this.init();
            else this.error = "Invalid scalar token";
        });
    }

    private init() {
        this.api.getBots().then(bots => {
            this.bots = bots;
            bots.map(b => b.isEnabled = Math.random() > 0.75);
        });
    }

}
