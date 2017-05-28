var request = require('request');
var log = require("../util/LogService");
var config = require("config");

/**
 * Represents a scalar client for vector.im
 */
class VectorScalarClient {

    /**
     * Creates a new vector.im Scalar client
     */
    constructor() {
    }

    /**
     * Registers for a scalar token
     * @param {OpenID} openId the open ID to register
     * @returns {Promise<string>} resolves to a scalar token
     */
    register(openId) {
        return this._do("POST", "/register", null, openId).then((response, body) => {
            var json = JSON.parse(response.body);
            return json['scalar_token'];
        });
    }

    /**
     * Removes a scalar integration
     * @param {string} type the type of integration to remove
     * @param {string} roomId the room ID to remove it from
     * @param {string} scalarToken the upstream scalar token
     * @return {Promise<>} resolves when complete
     */
    removeIntegration(type, roomId, scalarToken) {
        return this._do("POST", "/removeIntegration", {scalar_token: scalarToken}, {
            type: type,
            room_id: roomId
        }).then((response, body) => {
            if (response.statusCode !== 200) {
                log.error("VectorScalarClient", response.body);
                return Promise.reject(response.body);
            }

            // no success processing
        });
    }

    _do(method, endpoint, qs = null, body = null) {
        var url = config.get("upstreams.vector") + endpoint;

        log.verbose("VectorScalarClient", "Performing request: " + url);

        var params = {
            url: url,
            method: method,
            json: body,
            qs: qs
        };

        return new Promise((resolve, reject) => {
            request(params, (err, response, body) => {
                if (err) {
                    log.error("VectorScalarClient", err);
                    reject(err);
                } else resolve(response, body);
            });
        });
    }
}

module.exports = new VectorScalarClient();