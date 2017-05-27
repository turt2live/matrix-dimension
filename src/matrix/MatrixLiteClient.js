var request = require('request');
var log = require("../util/LogService");

/**
 * Represents a lightweight matrix client with minimal functionality
 */
class MatrixLiteClient {

    /**
     * Creates a new matrix client
     * @param {OpenID} openId the open ID to use
     */
    constructor(openId) {
        this._openId = openId;
    }

    /**
     * Gets the Matrix User ID that owns this open ID
     * @return {Promise<string>} resolves to the mxid
     */
    getSelfMxid() {
        return this._do("GET", "/_matrix/federation/v1/openid/userinfo").then((response, body) => {
            var json = JSON.parse(response.body);
            return json['sub'];
        });
    }

    _do(method, endpoint, qs = null, body = null) {
        var url = "http://" + this._openId.matrix_server_name + endpoint;

        log.verbose("MatrixLiteClient", "Performing request: " + url);

        if (!qs) qs = {};
        qs['access_token'] = this._openId.access_token;

        var params = {
            url: url,
            method: method,
            form: body,
            qs: qs
        };

        return new Promise((resolve, reject) => {
            request(params, (err, response, body) => {
                if (err) {
                    reject(err);
                } else resolve(response, body);
            });
        });
    }
}

module.exports = MatrixLiteClient;