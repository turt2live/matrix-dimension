var ComplexBot = require("../../type/ComplexBot");

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

    getFeeds() {
        return this._backbone.getFeeds();
    }

    /*override*/
    getState() {
        return this.getFeeds().then(feeds => {
            return {feeds: feeds};
        });
    }
}

module.exports = RSSBot;