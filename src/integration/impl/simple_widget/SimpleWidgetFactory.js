var SimpleWidget = require("./SimpleWidget");
var Promise = require("bluebird");

var factory = (db, integrationConfig, roomId, scalarToken) => {
    factory.validateConfig(integrationConfig);
    return Promise.resolve(new SimpleWidget(integrationConfig, roomId));
};

factory.validateConfig = (integrationConfig) => {
    // Nothing to do
};

module.exports = factory;