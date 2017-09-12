var LogService = require("./util/LogService");
var _ = require("lodash");
var config = require("config");

/**
 * Handles all upstream configuration information, such as URLs, tokens, and whether or not they are enabled.
 */
class UpstreamConfiguration {
    /**
     * Creates a new upstream configuration handler
     */
    constructor() {
        this._upstreams = {};
        this._loadUpstreams();
    }

    _loadUpstreams() {
        for (var upstream of config.upstreams) {
            var upstreamConfig = upstream;

            if (this._upstreams[upstream.name]) {
                LogService.warn("UpstreamConfiguration", "Duplicate upstream " + upstream.name +" - skipping");
                continue;
            }

            this._upstreams[upstream.name] = upstreamConfig;
            LogService.info("UpstreamConfiguration", "Loaded upstream '" + upstream.name + "' as: " + JSON.stringify(upstreamConfig));
        }
    }

    /**
     * Checks if a particular upstream exists
     * @param {string} name the name of the upstream
     * @returns {boolean} true if it is enabled and exists
     */
    hasUpstream(name) {
        return !!this._upstreams[name];
    }

    /**
     * Gets an upstream's configuration
     * @param {string} name the upstream name
     * @returns {{url:string}} the upstream configuration
     */
    getUpstream(name) {
        return _.clone(this._upstreams[name]);
    }
}

module.exports = new UpstreamConfiguration();