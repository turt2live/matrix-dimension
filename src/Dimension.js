var express = require("express");
var config = require("config");
var log = require("./util/LogService");
var DimensionStore = require("./storage/DimensionStore");
var bodyParser = require('body-parser');
var path = require("path");
var DimensionApi = require("./DimensionApi");
var ScalarApi = require("./ScalarApi");
var IRCApi = require("./integration/impl/irc/IRCApi");

// TODO: Convert backend to typescript? Would avoid stubbing classes all over the place

/**
 * Primary entry point for Dimension
 */
class Dimension {

    /**
     * Creates a new Dimension
     */
    constructor() {
    }

    /**
     * Starts the Dimension service
     * @param {DimensionStore} db the store to use
     */
    start(db) {
        this._db = db;
        this._app = express();
        this._app.use(express.static('web-dist'));
        this._app.use(bodyParser.json());

        // Register routes for angular app
        this._app.get(['/riot', '/riot/*', '/widgets', '/widgets/*'], (req, res) => {
            res.sendFile(path.join(__dirname, "..", "web-dist", "index.html"));
        });

        // Allow CORS
        this._app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        // Logging incoming requests
        this._app.use((req, res, next) => {
            log.verbose("Dimension", "Incoming: " + req.method + " " + req.url);
            next();
        });

        DimensionApi.bootstrap(this._app, this._db);
        ScalarApi.bootstrap(this._app, this._db);
        IRCApi.bootstrap(this._app, this._db);

        this._app.listen(config.get('web.port'), config.get('web.address'));
        log.info("Dimension", "API and UI listening on " + config.get("web.address") + ":" + config.get("web.port"));
    }
}

module.exports = new Dimension();