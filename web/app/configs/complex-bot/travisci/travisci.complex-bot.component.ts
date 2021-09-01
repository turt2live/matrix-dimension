import { ComplexBotComponent } from "../complex-bot.component";
import { Component } from "@angular/core";
import { SessionStorage } from "../../../shared/SessionStorage";
import { TranslateService } from "@ngx-translate/core";

interface TravisCiConfig {
    webhookId: string;
    repos: {
        [repoKey: string]: { // "turt2live/matrix-dimension"
            addedByUserId: string;
            template: string;
        };
    };
}

interface LocalRepo {
    repoKey: string;
    template: string;
    addedByUserId: string;
    isSelf: boolean;
}

@Component({
    templateUrl: "travisci.complex-bot.component.html",
    styleUrls: ["travisci.complex-bot.component.scss"],
})
export class TravisCiComplexBotConfigComponent extends ComplexBotComponent<TravisCiConfig> {

    public newRepoKey = "";

    constructor(public translate: TranslateService) {
        super("travisci", translate);
        this.translate = translate;
    }

    public get webhookUrl(): string {
        if (!this.newConfig) return "not specified";

        return window.location.origin + "/api/v1/dimension/webhooks/travisci/" + this.newConfig.webhookId;
    }

    public get travisYaml(): string {
        return "" +
            "notifications:\n" +
            "  webhooks:\n" +
            "    urls:\n" +
            "      - " + this.webhookUrl + "\n" +
            "    on_success: change  # always | never | change\n" +
            "    on_failure: always\n" +
            "    on_start: never\n";
    }

    public addRepo(): void {
        if (!this.newRepoKey.trim()) {
            this.translate.get('Please enter a repository').subscribe((res: string) => {
                this.toaster.pop('warning', res);
            });
            return;
        }

        this.newConfig.repos[this.newRepoKey] = {
            addedByUserId: SessionStorage.userId,
            template: "" +
                "%{repository_slug}#%{build_number} (%{branch} - %{commit} : %{author}): %{message}\n" +
                "    Change view : %{compare_url}\n" +
                "    Build details : %{build_url}\n"
        };
        this.newRepoKey = "";
    }

    public getRepos(): LocalRepo[] {
        if (!this.newConfig.repos) this.newConfig.repos = {};
        return Object.keys(this.newConfig.repos).map(r => {
            return {
                repoKey: r,
                template: this.newConfig.repos[r].template,
                addedByUserId: this.newConfig.repos[r].addedByUserId,
                isSelf: SessionStorage.userId === this.newConfig.repos[r].addedByUserId,
            };
        });
    }

    public removeRepo(repo: LocalRepo): void {
        delete this.newConfig.repos[repo.repoKey];
    }

    public async interceptSave(): Promise<any> {
        const memberEvent = await this.scalarClientApi.getMembershipState(this.roomId, this.bot.notificationUserId);
        const isJoined = memberEvent && memberEvent.response && ["join", "invite"].indexOf(memberEvent.response.membership) !== -1;

        if (!isJoined) {
            await this.scalarClientApi.inviteUser(this.roomId, this.bot.notificationUserId);
        }

        super.save();
    }
}
