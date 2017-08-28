var StubbedTravisCiBackbone = require("./StubbedTravisCiBackbone");
var VectorScalarClient = require("../../../scalar/VectorScalarClient");
var _ = require("lodash");
var log = require("../../../util/LogService");

/**
 * Backbone for Travis CI bots running on vector.im through scalar
 */
class VectorTravisCiBackbone extends StubbedTravisCiBackbone {

    /**
     * Creates a new Vector Travis CI backbone
     * @param {string} roomId the room ID to manage
     * @param {string} upstreamScalarToken the vector scalar token
     */
    constructor(roomId, upstreamScalarToken) {
        super();
        this._roomId = roomId;
        this._scalarToken = upstreamScalarToken;
        this._info = null;
        this._otherTemplates = [];
    }

    /*override*/
    getUserId() {
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            return this._info.bot_user_id;
        });
    }

    /*override*/
    getRepos() {
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            if (this._info.integrations.length == 0) return [];

            var rooms = _.keys(this._info.integrations[0].config.rooms);
            if (rooms.indexOf(this._roomId) === -1) return [];

            var repos = _.keys(this._info.integrations[0].config.rooms[this._roomId].repos);
            return _.map(repos, r => {
                return {repoKey: r, template: this._info.integrations[0].config.rooms[this._roomId].repos[r].template};
            });
        });
    }

    /*override*/
    getImmutableRepos() {
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            return this._otherTemplates;
        });
    }

    /*override*/
    setRepos(newRepos) {
        var config = {};
        config[this._roomId] = {repos: {}};
        for (var repo of newRepos) config[this._roomId].repos[repo.repoKey] = {template: repo.template};

        return VectorScalarClient.configureIntegration("travis-ci", this._scalarToken, {
            rooms: config
        });
    }

    /*override*/
    getWebhookUrl() {
        // string
        return (this._info ? Promise.resolve() : this._getInfo()).then(() => {
            if (this._info.integrations.length == 0) return "";
            return this._info.integrations[0].config.webhook_url;
        });
    }

    _getInfo() {
        return VectorScalarClient.getIntegrationsForRoom(this._roomId, this._scalarToken).then(integrations => {
            this._otherTemplates = [];
            for (var integration of integrations) {
                if (integration.self) continue; // skip - we're not looking for ones we know about
                if (integration.type == "travis-ci") {
                    var roomIds = _.keys(integration.config.rooms);
                    if (roomIds.length === 0) continue;
                    if (roomIds.length !== 1) log.warn("VectorTravisCiBackbone", "Expected 1 room but found " + roomIds.length);

                    var roomConfig = integration.config.rooms[roomIds[0]];
                    var repositories = _.keys(roomConfig.repos);

                    for (var repo of repositories) {
                        this._otherTemplates.push({
                            repoKey: repo,
                            template: roomConfig.repos[repo].template,
                            ownerId: integration.user_id
                        });
                    }
                }
            }

            return VectorScalarClient.getIntegration("travis-ci", this._roomId, this._scalarToken);
        }).then(info => {
            this._info = info;
        });
    }

    /*override*/
    removeFromRoom(roomId) {
        return VectorScalarClient.removeIntegration("travis-ci", roomId, this._scalarToken);
    }
}

module.exports = VectorTravisCiBackbone;