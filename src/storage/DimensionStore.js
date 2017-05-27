var DBMigrate = require("db-migrate");
var log = require("./../util/LogService");
var Sequelize = require('sequelize');
var dbConfig = require("../../config/database.json");

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

        // Relationships
    }
}

module.exports = DimensionStore;