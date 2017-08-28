var SimpleWidget = require("./SimpleWidget");
var Promise = require("bluebird");

module.exports = (db, integrationConfig, roomId, scalarToken) => {
    return Promise.resolve(new SimpleWidget(integrationConfig, roomId));
};