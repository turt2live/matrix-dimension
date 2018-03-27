import { ComplexBotComponent } from "../complex-bot.component";
import { Component } from "@angular/core";
import { SessionStorage } from "../../../shared/SessionStorage";

interface RssConfig {
    feeds: {
        [feedUrl: string]: {
            addedByUserId: string;
        };
    };
}

interface LocalFeed {
    url: string;
    addedByUserId: string;
    isSelf: boolean;
}

@Component({
    templateUrl: "rss.complex-bot.component.html",
    styleUrls: ["rss.complex-bot.component.scss"],
})
export class RssComplexBotConfigComponent extends ComplexBotComponent<RssConfig> {

    public newFeedUrl = "";

    constructor() {
        super("rss");
    }

    public addFeed(): void {
        if (!this.newFeedUrl.trim()) {
            this.toaster.pop('warning', 'Please enter a feed URL');
            return;
        }

        this.newConfig.feeds[this.newFeedUrl] = {addedByUserId: SessionStorage.userId};
        this.newFeedUrl = "";
    }

    public getFeeds(): LocalFeed[] {
        if (!this.newConfig.feeds) this.newConfig.feeds = {};
        return Object.keys(this.newConfig.feeds).map(url => {
            return {
                url: url,
                addedByUserId: this.newConfig.feeds[url].addedByUserId,
                isSelf: SessionStorage.userId === this.newConfig.feeds[url].addedByUserId,
            };
        });
    }

    public removeFeed(feed: LocalFeed): void {
        delete this.newConfig.feeds[feed.url];
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