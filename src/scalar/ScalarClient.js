var request = require('request');
var log = require("../util/LogService");
var config = require("config");

/**
 * Represents a scalar client
 */
class ScalarClient {

    /**
     * Creates a new Scalar client
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
            if (response.statusCode !== 200) {
                log.error("ScalarClient", response.body);
                return Promise.reject(response.body);
            }

            return response.body['scalar_token'];
        });
    }

    // TODO: Merge this, VectorScalarClient, and MatrixLiteClient into a base class
    _do(method, endpoint, qs = null, body = null) {
        // TODO: Generify URL
        var url = config.get("upstreams.vector") + endpoint;

        log.verbose("ScalarClient", "Performing request: " + url);

        var params = {
            url: url,
            method: method,
            json: body,
            qs: qs
        };

        return new Promise((resolve, reject) => {
            request(params, (err, response, body) => {
                if (err) {
                    log.error("ScalarClient", err);
                    reject(err);
                } else resolve(response, body);
            });
        });
    }
}

module.exports = new ScalarClient();