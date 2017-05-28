var IntegrationStub = require("../type/IntegrationStub");

/**
 * Creates an integration using the given
 * @param {DimensionStore} db the database
 * @param {*} integrationConfig the integration configuration
 * @param {string} roomId the room ID
 * @param {string} scalarToken the scalar token
 * @returns {Promise<*>} resolves to the configured integration
 */
module.exports = (db, integrationConfig, roomId, scalarToken) => {
    return Promise.resolve(new IntegrationStub(integrationConfig));
};