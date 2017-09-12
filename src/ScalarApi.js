var MatrixLiteClient = require("./matrix/MatrixLiteClient");
var randomString = require("random-string");
var ScalarClient = require("./scalar/ScalarClient.js");
var _ = require("lodash");
var log = require("./util/LogService");
var Promise = require("bluebird");
var UpstreamConfiguration = require("./UpstreamConfiguration");

/**
 * API handler for the Scalar API, as required by Riot
 */
class ScalarApi {

    /**
     * Creates a new Scalar API
     */
    constructor() {
    }

    /**
     * Bootstraps the Scalar API
     * @param {*} app the Express application
     * @param {DimensionStore} db the store to use
     */
    bootstrap(app, db) {
        this._db = db;

        app.post("/api/v1/scalar/register", this._scalarRegister.bind(this));
        app.get("/api/v1/scalar/checkToken", this._checkScalarToken.bind(this));
    }

    _checkScalarToken(req, res) {
        var token = req.query.scalar_token;
        if (!token) res.sendStatus(400);
        else this._db.checkToken(token).then(() => {
            res.sendStatus(200);
        }).catch(e => {
            res.sendStatus(401);
            log.warn("ScalarApi", "Failed to authenticate token");
            log.verbose("ScalarApi", e);
        });
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

            // TODO: Make this part more generic for other upstreams (#22)
            if (!UpstreamConfiguration.hasUpstream("vector")) return Promise.resolve(null);
            return ScalarClient.register(tokenInfo);
        }).then(upstreamToken => {
            return this._db.createToken(userId, tokenInfo, scalarToken, upstreamToken);
        }).then(() => {
            res.setHeader("Content-Type", "application/json");
            res.send({scalar_token: scalarToken});
        }).catch(err => {
            log.error("ScalarApi", err);
            res.status(500).send({error: err.message});
        });
    }
}

module.exports = new ScalarApi();