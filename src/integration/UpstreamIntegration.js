var VectorScalarClient = require("../scalar/VectorScalarClient");
var log = require("../util/LogService");
var StubbedIntegration = require("./StubbedIntegration");

/**
 * An integration that is handled by an upstream Scalar instance
 */
class UpstreamIntegration extends StubbedIntegration {

    /**
     * Creates a new hosted integration
     * @param integrationSettings the integration settings
     * @param {string} upstreamToken the upstream scalar token
     */
    constructor(integrationSettings, upstreamToken) {
        super();
        this._settings = integrationSettings;
        this._upstreamToken = upstreamToken;
        if (this._settings.upstream.type !== "vector") throw new Error("Unknown upstream type: " + this._settings.upstream.type);
    }

    /**
     * Leaves a given Matrix room
     * @param {string} roomId the room to leave
     * @returns {Promise<>} resolves when completed
     */
    leaveRoom(roomId) {
        log.info("UpstreamIntegration", "Removing " + this._settings.userId + " from " + roomId);
        return VectorScalarClient.removeIntegration(this._settings.upstream.id, roomId, this._upstreamToken);
    }
}

module.exports = UpstreamIntegration;