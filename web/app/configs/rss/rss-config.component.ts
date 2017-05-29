import { Component } from "@angular/core";
import { RSSIntegration } from "../../shared/models/integration";
import { ModalComponent, DialogRef } from "angular2-modal";
import { ConfigModalContext } from "../../integration/integration.component";
import { ToasterService } from "angular2-toaster";
import { ApiService } from "../../shared/api.service";

@Component({
    selector: 'my-rss-config',
    templateUrl: './rss-config.component.html',
    styleUrls: ['./rss-config.component.scss', './../config.component.scss'],
})
export class RssConfigComponent implements ModalComponent<ConfigModalContext> {

    public integration: RSSIntegration;

    public isUpdating = false;
    public feedUrl = "";

    private roomId: string;
    private scalarToken: string;

    constructor(public dialog: DialogRef<ConfigModalContext>,
                private toaster: ToasterService,
                private api: ApiService) {
        this.integration = <RSSIntegration>dialog.context.integration;
        this.roomId = dialog.context.roomId;
        this.scalarToken = dialog.context.scalarToken;
    }

    public addFeed() {
        if (!this.feedUrl || this.feedUrl.trim().length === 0) {
            this.toaster.pop("warning", "Please enter a feed URL");
            return;
        }
        if (this.integration.feeds.indexOf(this.feedUrl) !== -1) {
            this.toaster.pop("error", "This feed has already been added");
        }

        let feedCopy = JSON.parse(JSON.stringify(this.integration.feeds));
        feedCopy.push(this.feedUrl);
        this.updateFeeds(feedCopy);
    }

    public removeFeed(feedUrl) {
        let feedCopy = JSON.parse(JSON.stringify(this.integration.feeds));
        const idx = feedCopy.indexOf(feedUrl);
        feedCopy.splice(idx, 1);
        this.updateFeeds(feedCopy);
    }

    private updateFeeds(newFeeds) {
        this.isUpdating = true;
        this.api.updateIntegrationState(this.roomId, this.integration.type, this.integration.integrationType, this.scalarToken, {
            feeds: newFeeds
        }).then(response => {
            this.integration.feeds = response.feeds;
            this.integration.immutableFeeds = response.immutableFeeds;
            this.isUpdating = false;
            this.toaster.pop("success", "Feeds updated");
        }).catch(err => {
            this.toaster.pop("error", err.json().error);
            console.error(err);
            this.isUpdating = false;
        });
    }
}
