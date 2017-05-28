var StubbedRssBackbone = require("./StubbedRssBackbone");
var VectorScalarClient = require("../../../scalar/VectorScalarClient");
var _ = require("lodash");

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

    _getInfo() {
        return VectorScalarClient.getIntegration("rssbot", this._roomId, this._scalarToken).then(info => {
            this._info = info;
        });
    }

}

module.exports = VectorRssBackbone;