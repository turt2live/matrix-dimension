import { Integration } from "./Integration";
import { CachedSimpleBot } from "../db/BotStore";
import { IntegrationRecord } from "../db/models/IntegrationRecord";
import NebIntegration from "../db/models/NebIntegration";

export class SimpleBot extends Integration {
    private constructor(bot: IntegrationRecord, public userId: string) {
        super(bot);
        this.category = "bot";
        this.requirements = [];

        // We're going to go ahead and claim that none of the bots are supported in e2e rooms
        this.isEncryptionSupported = false;
    }

    public static fromCached(bot: CachedSimpleBot) {
        delete bot.accessToken;
        return new SimpleBot(bot, bot.userId);
    }

    public static fromNeb(bot: NebIntegration, userId: string) {
        return new SimpleBot(bot, userId);
    }
}