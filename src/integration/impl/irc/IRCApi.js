var Integrations = require("../../index");
var IntegrationImpl = require("../index");
var log = require("../../../util/LogService");

/**
 * API Handler for the IRC integration
 */
class IRCApi {

    /**
     * Creates a new IRC API
     */
    constructor() {
    }

    /**
     * Bootstraps the IRC API
     * @param {*} app the Express application
     * @param {DimensionStore} db the store to use
     */
    bootstrap(app, db) {
        if (!Integrations.byType["bridge"] || !Integrations.byType["bridge"]["irc"]) {
            log.info("IRCApi", "IRC Bridge not enabled - not setting up the API");
            return;
        } else log.info("IRCApi", "Setting up IRC API");

        this._db = db;

        app.get("/api/v1/irc/:roomId/ops/:network/:channel", this._getChannelOps.bind(this));
        app.put("/api/v1/irc/:roomId/channels/:network/:channel", this._addChannel.bind(this));
        app.delete("/api/v1/irc/:roomId/channels/:network/:channel", this._deleteChannel.bind(this));
    }

    _getChannelOps(req, res) {
        this._generalProcessing(req, res).then(ircBridge => {
            var network = req.params.network;
            var channel = req.params.channel;
            return ircBridge.getChannelOps(network, channel).catch(err => {
                log.error("IRCApi", err);
                console.error(err);
                res.status(500).send({error: err});
                return null;
            });
        }).then(ops => {
            if (ops !== null) res.status(200).send(ops);
        }).catch(() => null);
    }

    _addChannel(req, res) {
        this._generalProcessing(req, res).then(ircBridge => {
            var network = req.params.network;
            var channel = req.params.channel;
            var op = req.query.op;
            return ircBridge.addChannel(network, channel, op).catch(err => {
                log.error("IRCApi", err);
                console.error(err);
                res.status(500).send({error: err});
                return null;
            });
        }).then(result => {
            if (result !== null) res.status(200).send({successful: true});
        }).catch(() => null);
    }

    _deleteChannel(req, res) {
        this._generalProcessing(req, res).then(ircBridge => {
            var network = req.params.network;
            var channel = req.params.channel;
            return ircBridge.removeChannel(network, channel).catch(err => {
                log.error("IRCApi", err);
                console.error(err);
                res.status(500).send({error: err});
                return null;
            });
        }).then(result => {
            if (result !== null) res.status(200).send({successful: true});
        }).catch(() => null);
    }

    _generalProcessing(req, res) {
        return new Promise((resolve, reject) => {
            res.setHeader("Content-Type", "application/json");

            var roomId = req.params.roomId;
            var network = req.params.network;
            var channel = req.params.channel;
            if (!roomId || !network || !channel) {
                res.status(400).send({error: 'Missing room ID, network, or channel'});
                reject();
                return;
            }

            var scalarToken = req.query.scalar_token;
            this._db.checkToken(scalarToken).then(() => {
                var conf = Integrations.byType["bridge"]["irc"];
                var factory = IntegrationImpl.getFactory(conf);
                factory(this._db, conf, roomId, scalarToken).then(resolve).catch(err => {
                    log.error("IRCApi", err);
                    console.error(err);
                    res.status(500).send({error: err});
                    reject();
                });
            }).catch(err => {
                log.error("IRCApi", err);
                console.error(err);
                res.status(500).send({error: err});
                reject();
            });
        });
    }

}

module.exports = new IRCApi();