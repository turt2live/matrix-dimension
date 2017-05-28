var IntegrationStub = require("./IntegrationStub");

/**
 * Represents a bot with additional configuration or setup needs. Normally indicates a bot needs
 * more than a simple invite to the room.
 */
class ComplexBot extends IntegrationStub {

    /**
     * Creates a new complex bot
     * @param botConfig the configuration for the bot
     */
    constructor(botConfig) {
        super(botConfig);
    }
}

module.exports = ComplexBot;