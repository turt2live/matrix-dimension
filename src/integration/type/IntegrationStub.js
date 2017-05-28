/**
 * Stub for an Integration
 */
class IntegrationStub {
    constructor(botConfig) {
        this._config = botConfig;
    }

    /**
     * Gets the user ID for this bot
     * @return {Promise<string>} resolves to the user ID
     */
    getUserId() {
        return Promise.resolve(this._config.userId);
    }

    /**
     * Gets state information that represents how this bot is operating.
     * @return {Promise<*>} resolves to the state information
     */
    getState() {
        return Promise.resolve({});
    }
}

module.exports = IntegrationStub;
