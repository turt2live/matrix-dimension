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

    /**
     * Configures an Integration on Vector
     * @param {string} type the integration tpye
     * @param {string} scalarToken the scalar token
     * @param {*} config the config to POST to the service
     * @return {Promise<>} resolves when completed
     */
    configureIntegration(type, scalarToken, config) {
        return this._do("POST", "/integrations/" + type + "/configureService", {scalar_token: scalarToken}, config).then((response, body) => {
            if (response.statusCode !== 200) {
                log.error("VectorScalarClient", response.body);
                return Promise.reject(response.body);
            }

            // no success processing
        });
    }

    /**
     * Gets all of the integrations currently in a room
     * @param {string} roomId the room ID
     * @param {string} scalarToken the scalar token to use
     * @returns {Promise<*[]>} resolves a collection of integrations
     */
    getIntegrationsForRoom(roomId, scalarToken) {
        return this._do("POST", "/integrations", {scalar_token: scalarToken}, {RoomId: roomId}).then((response, body) => {
            if (response.statusCode !== 200) {
                log.error("VectorScalarClient", response.body);
                return Promise.reject(response.body);
            }

            return response.body.integrations;
        });
    }

    /**
     * Gets information for an integration
     * @param {string} type the type to lookup
     * @param {string} roomId the room ID to look in
     * @param {string} scalarToken the scalar token
     * @return {Promise<{bot_user_id:string,integrations:[]}>} resolves to the integration information
     */
    getIntegration(type, roomId, scalarToken) {
        return this._do("POST", "/integrations/" + type, {scalar_token: scalarToken}, {room_id: roomId}).then((response, body) => {
            if (response.statusCode !== 200) {
                log.error("VectorScalarClient", response.body);
                return Promise.reject(response.body);
            }

            return response.body;
        });
    }

    /**
     * Gets a list of supported IRC networks
     * @param {string} scalarToken the scalar token
     * @returns {Promise<{rid: string, title: string, domain: string, id: string}[]>} resolves to the list of IRC networks
     */
    getIrcNetworks(scalarToken) {
        return this._do("GET", "/bridges/irc/_matrix/provision/querynetworks", {scalar_token: scalarToken}).then((response, body) => {
            if (response.statusCode !== 200) {
                log.error("VectorScalarClient", response.body);
                return Promise.reject(response.body);
            }

            response.body = JSON.parse(response.body);

            var results = [];
            for (var network of response.body["replies"]) {
                var result = {
                    rid: network["rid"],
                    // Assumption: All networks have 1 server from vector
                    id: network["response"]["servers"][0]["network_id"],
                    title: network["response"]["servers"][0]["desc"],
                    domain: network["response"]["servers"][0]["fields"]["domain"]
                };
                results.push(result);
            }

            return results;
        });
    }

    /**
     * Gets a list of all linked IRC channels for a given room
     * @param {string} roomId the room ID to look in
     * @param {string} scalarToken the scalar token
     * @returns {Promise<{rid: string, server: string, channel: string}>} resolves to a list of linked channels
     */
    getIrcLinks(roomId, scalarToken) {
        return this._do("GET", "/bridges/irc/_matrix/provision/listlinks/" + roomId, {scalar_token: scalarToken}).then((response, body) => {
            if (response.statusCode !== 200) {
                log.error("VectorScalarClient", response.body);
                return Promise.reject(response.body);
            }

            response.body = JSON.parse(response.body);

            var results = [];
            for (var linkContainer of response.body["replies"]) {
                for (var link of linkContainer["response"]) {
                    results.push({
                        rid: linkContainer["rid"],
                        server: link["remote_room_server"],
                        channel: link["remote_room_channel"]
                    });
                }
            }

            return results;
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