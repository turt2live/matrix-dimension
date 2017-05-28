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
var integrations = require("./integration");
var _ = require("lodash");
var UpstreamIntegration = require("./integration/UpstreamIntegration");
var HostedIntegration = require("./integration/HostedIntegration");
var IntegrationImpl = require("./integration/impl");

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
        this._app.get(['/riot', '/riot/*'], (req, res) => {
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

        this._app.get("/api/v1/dimension/integrations/:roomId", this._getIntegrations.bind(this));
        this._app.post("/api/v1/dimension/removeIntegration", this._removeIntegration.bind(this));
    }

    start() {
        this._app.listen(config.get('web.port'), config.get('web.address'));
        log.info("Dimension", "API and UI listening on " + config.get("web.address") + ":" + config.get("web.port"));
    }

    _removeIntegration(req, res) {
        var roomId = req.body.roomId;
        var userId = req.body.userId;
        var scalarToken = req.body.scalarToken;

        if (!roomId || !userId || !scalarToken) {
            res.status(400).send({error: "Missing room, user, or token"});
            return;
        }

        var integrationConfig = integrations.byUserId[userId];
        if (!integrationConfig) {
            res.status(400).send({error: "Unknown integration"});
            return;
        }

        this._db.checkToken(scalarToken).then(() => {
            if (integrationConfig.upstream) {
                return this._db.getUpstreamToken(scalarToken).then(upstreamToken => new UpstreamIntegration(integrationConfig, upstreamToken));
            } else return new HostedIntegration(integrationConfig);
        }).then(integration => integration.leaveRoom(roomId)).then(() => {
            res.status(200).send({success: true});
        }).catch(err => res.status(500).send({error: err.message}));
    }

    _getIntegrations(req, res) {
        res.setHeader("Content-Type", "application/json");

        var scalarToken = req.query.scalar_token;
        this._db.checkToken(scalarToken).then(() => {
            var roomId = req.params.roomId;
            if (!roomId) {
                res.status(400).send({error: 'Missing room ID'});
                return;
            }

            var results = _.map(integrations.all, i => JSON.parse(JSON.stringify(i)));

            var promises = [];
            _.forEach(results, i => {
                if (IntegrationImpl[i.type]) {
                    var confs = IntegrationImpl[i.type];
                    if (confs[i.integrationType]) {
                        log.info("Dimension", "Using special configuration for " + i.type + " (" + i.integrationType + ")");

                        promises.push(confs[i.integrationType](this._db, i, roomId, scalarToken).then(integration => {
                            return integration.getUserId().then(userId=> {
                                i.userId = userId;
                                return integration.getState();
                            }).then(state=> {
                                for (var key in state) {
                                    i[key] = state[key];
                                }
                            });
                        }))
                    } else log.verbose("Dimension", "No special configuration needs for " + i.type + " (" + i.integrationType + ")");
                } else log.verbose("Dimension", "No special implementation type for " + i.type);
            });

            Promise.all(promises).then(() => res.send(_.map(results, integration => {
                integration.upstream = undefined;
                integration.hosted = undefined;
                return integration;
            })));
        }).catch(err => {
            log.error("Dimension", err);
            res.status(500).send({error: err});
        });
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