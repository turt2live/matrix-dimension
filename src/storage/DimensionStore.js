var DBMigrate = require("db-migrate");
var log = require("./../util/LogService");
var Sequelize = require('sequelize');
var dbConfig = require("../../config/database.json");
var moment = require("moment");

/**
 * Primary storage for Dimension.
 */
class DimensionStore {

    constructor() {
        this._orm = null;
    }

    /**
     * Prepares the store for use
     */
    prepare() {
        var env = process.env.NODE_ENV || "development";
        log.info("DimensionStore", "Running migrations");
        return new Promise((resolve, reject)=> {
            var dbMigrate = DBMigrate.getInstance(true, {
                config: "./config/database.json",
                env: env
            });
            dbMigrate.up().then(() => {
                var dbConfigEnv = dbConfig[env];
                if (!dbConfigEnv) throw new Error("Could not find DB config for " + env);

                var opts = {
                    host: dbConfigEnv.host || 'localhost',
                    dialect: 'sqlite',
                    pool: {
                        max: 5,
                        min: 0,
                        idle: 10000
                    },
                    storage: dbConfigEnv.filename,
                    logging: i => log.verbose("DimensionStore [SQL]", i)
                };

                this._orm = new Sequelize(dbConfigEnv.database || 'dimension', dbConfigEnv.username, dbConfigEnv.password, opts);
                this._bindModels();
                resolve();
            }, err => {
                log.error("DimensionStore", err);
                reject(err);
            }).catch(err => {
                log.error("DimensionStore", err);
                reject(err);
            });
        });
    }

    _bindModels() {
        // Models
        this.__Tokens = this._orm.import(__dirname + "/models/tokens");

        // Relationships
    }

    /**
     * Creates a new Scalar token
     * @param {string} mxid the matrix user id
     * @param {OpenID} openId the open ID
     * @param {string} scalarToken the token associated with the user
     * @param {string} upstreamToken the upstream scalar token
     * @returns {Promise<>} resolves when complete
     */
    createToken(mxid, openId, scalarToken, upstreamToken) {
        return this.__Tokens.create({
            matrixUserId: mxid,
            matrixServerName: openId.matrix_server_name,
            matrixAccessToken: openId.access_token,
            scalarToken: scalarToken,
            upstreamToken: upstreamToken,
            expires: moment().add(openId.expires_in, 'seconds').toDate()
        });
    }

    /**
     * Checks to determine if a token is valid or not
     * @param {string} scalarToken the scalar token to check
     * @returns {Promise<>} resolves if valid, rejected otherwise
     */
    checkToken(scalarToken) {
        return this.__Tokens.find({where: {scalarToken: scalarToken}}).then(token => {
            if (!token) return Promise.reject();
            //if (moment().isAfter(moment(token.expires))) return this.__Tokens.destroy({where: {id: token.id}}).then(() => Promise.reject());
            return Promise.resolve();
        });
    }

    /**
     * Gets the upstream token for a given scalar token
     * @param {string} scalarToken the scalar token to lookup
     * @returns {Promise<string>} resolves to the upstream token, or null if not found
     */
    getUpstreamToken(scalarToken) {
        return this.__Tokens.find({where: {scalarToken: scalarToken}}).then(token => {
            if (!token) return null;
            return token.upstreamToken;
        });
    }
}

module.exports = DimensionStore;