var IntegrationStub = require("../generic_types/IntegrationStub");

/**
 * Creates an integration using the given
 * @param {DimensionStore} db the database
 * @param {*} integrationConfig the integration configuration
 * @param {string} roomId the room ID
 * @param {string} scalarToken the scalar token
 * @returns {Promise<*>} resolves to the configured integration
 */
var factory = (db, integrationConfig, roomId, scalarToken) => {
    factory.validateConfig(integrationConfig);
    return Promise.resolve(new IntegrationStub(integrationConfig));
};

factory.validateConfig = (integrationConfig) => {
    // Nothing to do
};

module.exports = factory;