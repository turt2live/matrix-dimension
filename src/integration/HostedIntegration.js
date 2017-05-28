var sdk = require("matrix-js-sdk");
var log = require("../util/LogService");
var StubbedIntegration = require("./StubbedIntegration");

/**
 * Represents an integration hosted on a known homeserver
 */
class HostedIntegration extends StubbedIntegration {

    /**
     * Creates a new hosted integration
     * @param integrationSettings the integration settings
     */
    constructor(integrationSettings) {
        super();
        this._settings = integrationSettings;
        this._client = sdk.createClient({
            baseUrl: this._settings.hosted.homeserverUrl,
            accessToken: this._settings.hosted.accessToken,
            userId: this._settings.userId,
        });
    }

    /**
     * Leaves a given Matrix room
     * @param {string} roomId the room to leave
     * @returns {Promise<>} resolves when completed
     */
    leaveRoom(roomId) {
        log.info("HostedIntegration", "Removing " + this._settings.userId + " from " + roomId);
        return this._client.leave(roomId);
    }
}

module.exports = HostedIntegration;