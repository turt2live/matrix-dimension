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

    /**
     * Removes the integration from the given room
     * @param {string} roomId the room ID to remove the integration from
     * @returns {Promise<>} resolves when completed
     */
    removeFromRoom(roomId) {
        throw new Error("Not implemented");
    }
}

module.exports = IntegrationStub;
