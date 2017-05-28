var ComplexBot = require("../../generic_types/ComplexBot");

/**
 * Represents an RSS bot
 */
class RSSBot extends ComplexBot {

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
    getUserId() {
        return this._backbone.getUserId();
    }

    /*override*/
    getState() {
        return this._backbone.getFeeds().then(feeds => {
            return {feeds: feeds};
        });
    }

    /*override*/
    removeFromRoom(roomId) {
        return this._backbone.removeFromRoom(roomId);
    }
}

module.exports = RSSBot;