import { Integration } from "./Integration";
import NebIntegration from "../db/models/NebIntegration";

export class SimpleBot extends Integration {
    constructor(bot: NebIntegration, public userId: string) {
        super(bot);
        this.category = "bot";
        this.requirements = [];

        // We're going to go ahead and claim that none of the bots are supported in e2e rooms
        this.isEncryptionSupported = false;
    }
}