var VectorScalarClient = require("../../../scalar/VectorScalarClient");
var log = require("../../../util/LogService");
var StubbedSimpleBackbone = require("./StubbedSimpleBackbone");

/**
 * Vector backbone for simple bots
 */
class VectorSimpleBackbone extends StubbedSimpleBackbone {

    /**
     * Creates a new vector bot backbone
     * @param {*} botConfig the configuration for the bot
     * @param {string} upstreamScalarToken the upstream scalar token
     */
    constructor(botConfig, upstreamScalarToken) {
        super(botConfig);
        this._config = botConfig;
        this._upstreamToken = upstreamScalarToken;
    }

    /*override*/
    removeFromRoom(roomId) {
        log.info("VectorSimpleBackbone", "Removing " + this._config.userId + " from " + roomId);
        return VectorScalarClient.removeIntegration(this._config.upstream.id, roomId, this._upstreamToken);
    }
}

module.exports = VectorSimpleBackbone;