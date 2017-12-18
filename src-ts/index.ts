import { LogService } from "matrix-js-snippets";
import config from "./config";
import { DimensionStore } from "./db/DimensionStore";
import Webserver from "./api/Webserver";

LogService.configure(config.logging);
LogService.info("index", "Starting voyager...");

const webserver = new Webserver();

DimensionStore.updateSchema()
    .then(() => webserver.start())
    .then(() => {
        LogService.info("index", "Dimension is ready!");
    });