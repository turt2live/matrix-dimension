var express = require("express");
var config = require("config");
var log = require("./util/LogService");
var DimensionStore = require("./storage/DimensionStore");

/**
 * Primary entry point for Dimension
 */
class Dimension {

    /**
     * Creates a new Dimension
     * @param {DimensionStore} db the storage
     */
    constructor(db) {
        this._db = db;
        this._app = express();
        this._app.use(express.static('web-dist'));
    }

    start() {
        this._app.listen(config.get('web.port'), config.get('web.address'));
        log.info("Dimension", "API and UI listening on " + config.get("web.address") + ":" + config.get("web.port"));
    }

}

module.exports = Dimension;