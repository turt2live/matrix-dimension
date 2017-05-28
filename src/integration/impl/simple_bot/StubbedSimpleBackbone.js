/**
 * Stubbed backbone for simple bots
 */
class StubbedSimpleBackbone {

    /**
     * Creates a new stubbed bot backbone
     * @param {*} botConfig the configuration for the bot
     */
    constructor(botConfig) {
        this._config = botConfig;
    }

    /**
     * Leaves a given Matrix room
     * @param {string} roomId the room to leave
     * @returns {Promise<>} resolves when completed
     */
    removeFromRoom(roomId) {
        throw new Error("Not implemented");
    }
}

module.exports = StubbedSimpleBackbone;