import { Integration } from "./Integration";
import NebIntegration from "../db/models/NebIntegration";

export class ComplexBot extends Integration {
    constructor(bot: NebIntegration, public notificationUserId: string, public botUserId?: string) {
        super(bot);
        this.category = "complex-bot";
        this.requirements = [];

        // Notification bots are technically supported in e2e rooms
        this.isEncryptionSupported = true;
    }
}