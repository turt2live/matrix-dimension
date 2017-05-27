var express = require("express");
var config = require("config");
var log = require("./util/LogService");
var DimensionStore = require("./storage/DimensionStore");
var bodyParser = require('body-parser');
var path = require("path");
var MatrixLiteClient = require("./matrix/MatrixLiteClient");
var randomString = require("random-string");

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
        this._app.use(bodyParser.json());

        // Register routes for angular app
        this._app.get(['/riot/*', '/app/*', '/splash/*'], (req, res) => {
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

        this._app.post("/api/v1/scalar/register", this._scalarRegister.bind(this));
    }

    start() {
        this._app.listen(config.get('web.port'), config.get('web.address'));
        log.info("Dimension", "API and UI listening on " + config.get("web.address") + ":" + config.get("web.port"));
    }

    _scalarRegister(req, res) {
        var tokenInfo = req.body;
        if (!tokenInfo || !tokenInfo['access_token'] || !tokenInfo['token_type'] || !tokenInfo['matrix_server_name'] || !tokenInfo['expires_in']) {
            res.status(400).send('Missing OpenID');
            return;
        }

        var client = new MatrixLiteClient(tokenInfo);
        var scalarToken = randomString({length: 25});
        client.getSelfMxid().then(mxid => {
            return this._db.createToken(mxid, tokenInfo, scalarToken);
        }).then(() => {
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify({scalar_token: scalarToken}));
        }, err => {
            throw err;
            //res.status(500).send(err.message);
        });
    }
}

module.exports = Dimension;