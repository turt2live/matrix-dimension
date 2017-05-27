var express = require("express");
var config = require("config");
var log = require("./util/LogService");
var DimensionStore = require("./storage/DimensionStore");
var bodyParser = require('body-parser');
var path = require("path");
var MatrixLiteClient = require("./matrix/MatrixLiteClient");
var randomString = require("random-string");
var ScalarClient = require("./scalar/ScalarClient.js");
var VectorScalarClient = require("./scalar/VectorScalarClient");

/**
 * Primary entry point for Dimension
 */
class Dimension {

    // TODO: Spread the app out into other classes
    // eg: ScalarApi, DimensionApi, etc

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
        this._app.get("/api/v1/scalar/checkToken", this._checkScalarToken.bind(this));

        this._app.get("/api/v1/dimension/bots", this._getBots.bind(this));
        this._app.post("/api/v1/dimension/kick", this._kickUser.bind(this));
    }

    start() {
        this._app.listen(config.get('web.port'), config.get('web.address'));
        log.info("Dimension", "API and UI listening on " + config.get("web.address") + ":" + config.get("web.port"));
    }

    _kickUser(req, res) {
        // {roomId: roomId, userId: userId, scalarToken: scalarToken}
        var roomId = req.body.roomId;
        var userId = req.body.userId;
        var scalarToken = req.body.scalarToken;

        if (!roomId || !userId || !scalarToken) {
            res.status(400).send({error: "Missing room, user, or token"});
            return;
        }

        var integrationName = null;
        this._db.checkToken(scalarToken).then(() => {
            for (var bot of config.bots) {
                if (bot.mxid == userId) {
                    integrationName = bot.upstreamType;
                    break;
                }
            }

            return this._db.getUpstreamToken(scalarToken);
        }).then(upstreamToken => {
            if (!upstreamToken || !integrationName) {
                res.status(400).send({error: "Missing token or integration name"});
                return Promise.resolve();
            } else return VectorScalarClient.removeIntegration(integrationName, roomId, upstreamToken);
        }).then(() => res.status(200).send({success: true})).catch(err => res.status(500).send({error: err.message}));
    }

    _getBots(req, res) {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(config.bots));
    }

    _checkScalarToken(req, res) {
        var token = req.query.scalar_token;
        if (!token) res.sendStatus(400);
        else this._db.checkToken(token).then(() => {
            res.sendStatus(200);
        }).catch(() => res.sendStatus(401));
    }

    _scalarRegister(req, res) {
        res.setHeader("Content-Type", "application/json");

        var tokenInfo = req.body;
        if (!tokenInfo || !tokenInfo['access_token'] || !tokenInfo['token_type'] || !tokenInfo['matrix_server_name'] || !tokenInfo['expires_in']) {
            res.status(400).send({error: 'Missing OpenID'});
            return;
        }

        var client = new MatrixLiteClient(tokenInfo);
        var scalarToken = randomString({length: 25});
        var userId;
        client.getSelfMxid().then(mxid => {
            userId = mxid;
            if (!mxid) throw new Error("Token does not resolve to a matrix user");
            return ScalarClient.register(tokenInfo);
        }).then(upstreamToken => {
            return this._db.createToken(userId, tokenInfo, scalarToken, upstreamToken);
        }).then(() => {
            res.setHeader("Content-Type", "application/json");
            res.send({scalar_token: scalarToken});
        }).catch(err => {
            log.error("Dimension", err);
            res.status(500).send({error: err.message});
        });
    }
}

module.exports = Dimension;