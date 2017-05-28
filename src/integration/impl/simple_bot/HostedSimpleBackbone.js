var sdk = require("matrix-js-sdk");
var log = require("../../../util/LogService");
var IntegrationStub = require("../../type/IntegrationStub");

/**
 * Standalone (matrix) backbone for simple bots
 */
class HostedSimpleBackbone extends IntegrationStub {

    /**
     * Creates a new standalone bot backbone
     * @param {*} botConfig the configuration for the bot
     */
    constructor(botConfig) {
        super(botConfig);
        this._config = botConfig;
        this._client = sdk.createClient({
            baseUrl: this._config.hosted.homeserverUrl,
            accessToken: this._config.hosted.accessToken,
            userId: this._config.userId,
        });
    }

    /**
     * Leaves a given Matrix room
     * @param {string} roomId the room to leave
     * @returns {Promise<>} resolves when completed
     */
    /*override*/
    removeFromRoom(roomId) {
        log.info("HostedSimpleBackbone", "Removing " + this._settings.userId + " from " + roomId);
        return this._client.leave(roomId);
    }
}

module.exports = HostedSimpleBackbone;