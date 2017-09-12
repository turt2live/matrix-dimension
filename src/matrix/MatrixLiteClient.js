var request = require('request');
var log = require("../util/LogService");
var dns = require("dns-then");
var Promise = require("bluebird");

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
        return this._do("GET", "/_matrix/federation/v1/openid/userinfo", /*qs=*/null, /*body=*/null, /*allowSelfSigned=*/true).then((response, body) => {
            var json = JSON.parse(response.body);
            return json['sub'];
        });
    }

    _do(method, endpoint, qs = null, body = null, allowSelfSigned = false) {
        var serverName = this._openId.matrix_server_name;
        // HACK: We have to wrap the dns promise in a Bluebird promise just to make sure it works
        var dnsPromise = dns.resolveSrv("_matrix._tcp." + serverName);
        return Promise.resolve(dnsPromise).then(records => {
            if (records && records.length > 0)
                serverName = records[0].name + ":" + records[0].port;
        }, err => {
            log.warn("MatrixLiteClient", "Failed to lookup SRV for " + serverName + " - assuming none available.");
            log.warn("MatrixLiteClient", err);
        }).then(() => {
            var url = "https://" + serverName + endpoint;

            log.verbose("MatrixLiteClient", "Performing request: " + url);

            if (!qs) qs = {};
            qs['access_token'] = this._openId.access_token;

            var params = {
                url: url,
                method: method,
                form: body,
                qs: qs,
                rejectUnauthorized: !allowSelfSigned
            };

            return new Promise((resolve, reject) => {
                request(params, (err, response, body) => {
                    if (err) {
                        log.error("MatrixLiteClient", err);
                        reject(err);
                    } else resolve(response, body);
                });
            });
        });
    }
}

module.exports = MatrixLiteClient;