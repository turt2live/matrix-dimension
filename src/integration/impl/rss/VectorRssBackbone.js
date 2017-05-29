var StubbedRssBackbone = require("./StubbedRssBackbone");
var VectorScalarClient = require("../../../scalar/VectorScalarClient");
var _ = require("lodash");
var log = require("../../../util/LogService");

/**
 * Backbone for RSS bots running on vector.im through scalar
 */
class VectorRssBackbone extends StubbedRssBackbone {

    /**
     * Creates a new Vector RSS backbone
     * @param {string} roomId the room ID to manage
     * @param {string} upstreamScalarToken the vector scalar token
     */
    constructor(roomId, upstreamScalarToken) {
        super();
        this._roomId = roomId;
        this._scalarToken = upstreamScalarToken;
        this._info = null;
        this._otherFeeds = [];
    }

    /*override*/
    getUserId() {
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            return this._info.bot_user_id;
        });
    }

    /*override*/
    getFeeds() {
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            if (this._info.integrations.length == 0) return [];
            return _.keys(this._info.integrations[0].config.feeds);
        });
    }

    /*override*/
    setFeeds(newFeeds) {
        var feedConfig = {};
        for (var feed of newFeeds) feedConfig[feed] = {};

        return VectorScalarClient.configureIntegration("rssbot", this._scalarToken, {
            feeds: feedConfig,
            room_id: this._roomId
        });
    }

    /*override*/
    getImmutableFeeds() {
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            return this._otherFeeds;
        });
    }

    _getInfo() {
        return VectorScalarClient.getIntegrationsForRoom(this._roomId, this._scalarToken).then(integrations => {
            this._otherFeeds = [];
            for (var integration of integrations) {
                if (integration.self) continue; // skip - we're not looking for ones we know about
                if (integration.type == "rssbot") {
                    var urls = _.keys(integration.config.feeds);
                    for (var url of urls) {
                        this._otherFeeds.push({url: url, ownerId: integration.user_id});
                    }
                }
            }

            return VectorScalarClient.getIntegration("rssbot", this._roomId, this._scalarToken);
        }).then(info => {
            this._info = info;
        });
    }

    /*override*/
    removeFromRoom(roomId) {
        return VectorScalarClient.removeIntegration("rssbot", roomId, this._scalarToken);
    }
}

module.exports = VectorRssBackbone;