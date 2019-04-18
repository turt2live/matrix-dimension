import { LogService } from "matrix-js-snippets";
import config from "./config";
import { DimensionStore } from "./db/DimensionStore";
import Webserver from "./api/Webserver";
import { CURRENT_VERSION } from "./version";
import { MatrixStickerBot } from "./matrix/MatrixStickerBot";
import * as BotSdk from "matrix-bot-sdk";
import User from "./db/models/User";

LogService.configure(config.logging);
LogService.info("index", "Starting dimension " + CURRENT_VERSION);

// Redirect the bot-sdk logger to our logger
BotSdk.LogService.setLogger({
    debug: (module: string, ...args: any[]) => args.map(a => LogService.info("BotSdk-" + module, a)),
    info: (module: string, ...args: any[]) => args.map(a => LogService.info("BotSdk-" + module, a)),
    warn: (module: string, ...args: any[]) => args.map(a => LogService.warn("BotSdk-" + module, a)),
    error: (module: string, ...args: any[]) => args.map(a => LogService.error("BotSdk-" + module, a)),
});

async function startup() {
    await DimensionStore.updateSchema();

    const webserver = new Webserver();
    await webserver.start();

    const userId = await MatrixStickerBot.getUserId();
    const users = await User.findAll({where: {userId: userId, isSelfBot: false}});
    if (users.length > 0) {
        LogService.error("index", "The access token configured for Dimension belongs to a user which is also " +
            "a user known to Dimension. This usually indicates that the access token is not a dedicated user " +
            "account for Dimension. To prevent potential confusion to this user, Dimension will refuse to start " +
            "until the access token given belongs to a dedicated user.");
        throw new Error("Access token belongs to a real user. See logs for details.");
    }

    LogService.info("index", "Sticker bot is using utility account, registered as " + userId);
    await MatrixStickerBot.start();
}

startup()
    .then(() => LogService.info("index", "Dimension is ready!"))
    .catch((e) => {
        console.error(e);
        process.exit(1)
    });