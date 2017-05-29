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
        var response = {
            feeds: [],
            immutableFeeds: []
        };
        return this._backbone.getFeeds().then(feeds => {
            response.feeds = feeds;
            return this._backbone.getImmutableFeeds();
        }).then(feeds => {
            response.immutableFeeds = feeds;
            return response;
        });
    }

    /*override*/
    removeFromRoom(roomId) {
        return this._backbone.removeFromRoom(roomId);
    }

    /*override*/
    updateState(newState) {
        return this._backbone.setFeeds(newState.feeds).then(() => this.getState());
    }
}

module.exports = RSSBot;