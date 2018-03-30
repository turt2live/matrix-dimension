import { Integration } from "./Integration";
import NebIntegration from "../db/models/NebIntegration";

export class ComplexBot extends Integration {
    constructor(bot: NebIntegration, public notificationUserId: string, public botUserId: string, public config: any) {
        super(bot);
        this.category = "complex-bot";
        this.requirements = [];

        // Notification bots are technically supported in e2e rooms
        this.isEncryptionSupported = true;
    }
}

export interface RssBotConfiguration {
    feeds: {
        [url: string]: {
            addedByUserId: string;
        };
    };
}

export interface TravisCiConfiguration {
    webhookUrl: string;
    repos: {
        [repoKey: string]: {
            addedByUserId: string;
            template: string;
        }
    }
}