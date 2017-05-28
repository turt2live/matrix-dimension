var IntegrationStub = require("../../generic_types/IntegrationStub");

/**
 * Represents an RSS bot
 */
class SimpleBot extends IntegrationStub {

    /**
     * Creates a new RSS bot
     * @param botConfig the bot configuration
     * @param backbone the backbone powering this bot
     */
    constructor(botConfig, backbone) {
        super(botConfig);
        this._backbone = backbone;
    }

    /*override*/
    removeFromRoom(roomId) {
        return this._backbone.removeFromRoom(roomId);
    }
}

module.exports = SimpleBot;