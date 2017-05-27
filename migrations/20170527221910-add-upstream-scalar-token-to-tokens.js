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
    return db.addColumn('tokens', 'upstreamToken', {type: 'string', notNull: false}); // has to be nullable, despite our best intentions
};

exports.down = function (db) {
    return db.removeColumn('tokens', 'upstreamToken');
};

exports._meta = {
    "version": 1
};
