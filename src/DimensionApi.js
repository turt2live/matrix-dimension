const IntegrationImpl = require("./integration/impl/index");
const Integrations = require("./integration/index");
const _ = require("lodash");
const log = require("./util/LogService");
const request = require("request");
const dns = require("dns-then");
const urlParse = require("url");
const Netmask = require("netmask").Netmask;
const config = require("config");

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
        app.get("/api/v1/dimension/widgets/embeddable", this._checkEmbeddable.bind(this));
    }

    _checkEmbeddable(req, res) {
        // Unauthed endpoint.

        var url = req.query.url;
        var parts = urlParse.parse(url);
        var processed = false;

        // Only allow http and https
        if (parts.protocol !== "http:" && parts.protocol !== "https:") {
            res.status(400).send({error: "Invalid request scheme " + parts.protocol, canEmbed: false});
            processed = true;
            return;
        }

        // Verify the address is permitted for widgets
        var hostname = parts.hostname.split(":")[0];
        dns.resolve4(hostname).then(addresses => {
            log.verbose("DimensionApi", "Hostname " + hostname + " resolves to " + addresses);
            if (addresses.length == 0) {
                res.status(400).send({error: "Unrecongized address", canEmbed: false});
                processed = true;
                return;
            }
            for (var ipOrCidr of config.get("widgetBlacklist")) {
                var block = new Netmask(ipOrCidr);
                for (var address of addresses) {
                    if (block.contains(address)) {
                        res.status(400).send({error: "Address not allowed", canEmbed: false});
                        processed = true;
                        return;
                    }
                }
            }
        }, err => {
            log.verbose("DimensionApi", "Error resolving host " + hostname);
            log.verbose("DimensionApi", err);

            res.status(400).send({error: "DNS error", canEmbed: false});
            processed = true;
        }).then(() => {
            if (processed) return;

            // Verify that the content can actually be embedded (CORS)
            request(url, (err, response) => {
                if (err) {
                    log.verbose("DimensionApi", "Error contacting host " + hostname);
                    log.verbose("DimensionApi", err);

                    res.status(400).send({error: "Host error", canEmbed: false});
                    return;
                }

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    // 200 OK
                    var headers = response.headers;
                    var xFrameOptions = (headers['x-frame-options'] || '').toLowerCase();

                    if (xFrameOptions === 'sameorigin' || xFrameOptions === 'deny') {
                        res.status(400).send({error: "X-Frame-Options forbids embedding", canEmbed: false});
                    } else res.status(200).send({canEmbed: true});
                } else {
                    res.status(400).send({error: "Unsuccessful status code: " + response.statusCode, canEmbed: false});
                }
            });
        });
    }

    _getIntegration(integrationConfig, roomId, scalarToken) {
        var factory = IntegrationImpl.getFactory(integrationConfig);
        if (!factory) throw new Error("Missing config factory for " + integrationConfig.name);

        try {
            return factory(this._db, integrationConfig, roomId, scalarToken);
        } catch (err) {
            throw new Error("Error using factory for " + integrationConfig.name + ". Please either fix the integration settings or disable the integration.", err);
        }
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
            var remove = [];
            _.forEach(integrations, integration => {
                try {
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
                } catch (err) {
                    remove.push(integration);
                    log.error("DimensionApi", err);
                }
            });

            for (var toRemove of remove) {
                var idx = integrations.indexOf(toRemove);
                if (idx === -1) continue;
                log.warn("DimensionApi", "Disabling integration " + toRemove.name + " due to an error encountered in setup");
                integrations.splice(idx, 1);
            }

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
