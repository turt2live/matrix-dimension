var IntegrationImpl = require("./integration/impl/index");
var Integrations = require("./integration/index");
var _ = require("lodash");
var log = require("./util/LogService");

/**
 * API handler for the Dimension API
 */
class DimensionApi {

    /**
     * Creates a new Dimension API
     */
    constructor() {
    }

    /**
     * Bootstraps the Dimension API
     * @param {*} app the Express application
     * @param {DimensionStore} db the store to use
     */
    bootstrap(app, db) {
        this._db = db;

        app.get("/api/v1/dimension/integrations/:roomId", this._getIntegrations.bind(this));
        app.delete("/api/v1/dimension/integrations/:roomId/:type/:integrationType", this._removeIntegration.bind(this));
        app.put("/api/v1/dimension/integrations/:roomId/:type/:integrationType/state", this._updateIntegrationState.bind(this));
        app.get("/api/v1/dimension/integrations/:roomId/:type/:integrationType/state", this._getIntegrationState.bind(this));
    }

    _getIntegration(integrationConfig, roomId, scalarToken) {
        var factory = IntegrationImpl.getFactory(integrationConfig);
        if (!factory) throw new Error("Missing config factory for " + integrationConfig.name);

        return factory(this._db, integrationConfig, roomId, scalarToken);
    }

    _getIntegrations(req, res) {
        res.setHeader("Content-Type", "application/json");

        var roomId = req.params.roomId;
        if (!roomId) {
            res.status(400).send({error: 'Missing room ID'});
            return;
        }

        var scalarToken = req.query.scalar_token;
        this._db.checkToken(scalarToken).then(() => {
            var integrations = _.map(Integrations.all, i => JSON.parse(JSON.stringify(i))); // clone

            var promises = [];
            _.forEach(integrations, integration => {
                promises.push(this._getIntegration(integration, roomId, scalarToken).then(builtIntegration => {
                    return builtIntegration.getState().then(state => {
                        var keys = _.keys(state);
                        for (var key of keys) {
                            integration[key] = state[key];
                        }

                        return builtIntegration.getUserId();
                    }).then(userId => {
                        integration.userId = userId;
                    });
                }));
            });

            Promise.all(promises).then(() => res.send(_.map(integrations, integration => {
                // Remove sensitive material
                integration.upstream = undefined;
                integration.hosted = undefined;
                return integration;
            })));
        }).catch(err => {
            log.error("DimensionApi", err);
            console.error(err);
            res.status(500).send({error: err});
        });
    }

    _removeIntegration(req, res) {
        var roomId = req.params.roomId;
        var scalarToken = req.query.scalar_token;
        var type = req.params.type;
        var integrationType = req.params.integrationType;

        if (!roomId || !scalarToken || !type || !integrationType) {
            res.status(400).send({error: "Missing room, integration type, type, or token"});
            return;
        }

        var integrationConfig = Integrations.byType[type][integrationType];
        if (!integrationConfig) {
            res.status(400).send({error: "Unknown integration"});
            return;
        }

        log.info("DimensionApi", "Remove requested for " + type + " (" + integrationType + ") in room " + roomId);

        this._db.checkToken(scalarToken).then(() => {
            return this._getIntegration(integrationConfig, roomId, scalarToken);
        }).then(integration => integration.removeFromRoom(roomId)).then(() => {
            res.status(200).send({success: true});
        }).catch(err => {
            log.error("DimensionApi", err);
            console.error(err);
            res.status(500).send({error: err.message});
        });
    }

    _updateIntegrationState(req, res) {
        var roomId = req.params.roomId;
        var scalarToken = req.body.scalar_token;
        var type = req.params.type;
        var integrationType = req.params.integrationType;

        if (!roomId || !scalarToken || !type || !integrationType) {
            res.status(400).send({error: "Missing room, integration type, type, or token"});
            return;
        }

        var integrationConfig = Integrations.byType[type][integrationType];
        if (!integrationConfig) {
            res.status(400).send({error: "Unknown integration"});
            return;
        }

        log.info("DimensionApi", "Update state requested for " + type + " (" + integrationType + ") in room " + roomId);

        this._db.checkToken(scalarToken).then(() => {
            return this._getIntegration(integrationConfig, roomId, scalarToken);
        }).then(integration => {
            return integration.updateState(req.body.state);
        }).then(newState => {
            res.status(200).send(newState);
        }).catch(err => {
            log.error("DimensionApi", err);
            console.error(err);
            res.status(500).send({error: err.message});
        });
    }

    _getIntegrationState(req, res) {
        var roomId = req.params.roomId;
        var scalarToken = req.query.scalar_token;
        var type = req.params.type;
        var integrationType = req.params.integrationType;

        if (!roomId || !scalarToken || !type || !integrationType) {
            res.status(400).send({error: "Missing room, integration type, type, or token"});
            return;
        }

        var integrationConfig = Integrations.byType[type][integrationType];
        if (!integrationConfig) {
            res.status(400).send({error: "Unknown integration"});
            return;
        }

        log.info("DimensionApi", "State requested for " + type + " (" + integrationType + ") in room " + roomId);

        this._db.checkToken(scalarToken).then(() => {
            return this._getIntegration(integrationConfig, roomId, scalarToken);
        }).then(integration => {
            return integration.getState();
        }).then(state => {
            res.status(200).send(state);
        }).catch(err => {
            log.error("DimensionApi", err);
            console.error(err);
            res.status(500).send({error: err.message});
        });
    }
}

module.exports = new DimensionApi();
