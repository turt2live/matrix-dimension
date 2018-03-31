import { LogService } from "matrix-js-snippets";
import config from "./config";
import { DimensionStore } from "./db/DimensionStore";
import Webserver from "./api/Webserver";
import { CURRENT_VERSION } from "./version";

LogService.configure(config.logging);
LogService.info("index", "Starting dimension " + CURRENT_VERSION);

async function startup() {
    await DimensionStore.updateSchema();

    const webserver = new Webserver();
    await webserver.start();
}

startup().then(() => LogService.info("index", "Dimension is ready!"));