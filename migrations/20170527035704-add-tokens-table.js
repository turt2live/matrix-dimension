'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db) {
    return db.createTable("tokens", {
        id: {type: 'int', primaryKey: true, autoIncrement: true, notNull: true},
        matrixUserId: {type: 'string', notNull: true},
        matrixServerName: {type: 'string', notNull: true},
        matrixAccessToken: {type: 'string', notNull: true},
        scalarToken: {type: 'string', notNull: true},
        expires: {type: 'timestamp', notNull: true}
    });
};

exports.down = function (db) {
    return db.dropTable("tokens");
};

exports._meta = {
    "version": 1
};
