var StubbedIrcBackbone = require("./StubbedIrcBackbone");
var VectorScalarClient = require("../../../scalar/VectorScalarClient");
var _ = require("lodash");
var log = require("../../../util/LogService");

/**
 * Backbone for IRC bridges running on vector.im through scalar
 */
class VectorIrcBackbone extends StubbedIrcBackbone {

    /**
     * Creates a new Vector IRC backbone
     * @param {string} roomId the room ID to manage
     * @param {string} upstreamScalarToken the vector scalar token
     */
    constructor(roomId, upstreamScalarToken) {
        super();
        this._roomId = roomId;
        this._scalarToken = upstreamScalarToken;
        this._lastNetworkResponse = null;
    }

    /*override*/
    getNetworks() {
        return this._getNetworks().then(networks => _.map(networks, n => {
            return {name: n.title, id: n.id};
        }));
    }

    /*override*/
    getLinkedChannels() {
        var networks;
        return this._getNetworks().then(n => {
            networks = n;
            return VectorScalarClient.getIrcLinks(this._roomId, this._scalarToken);
        }).then(links => {
            var container = {};

            var ridToServerId = {};

            for (var network of networks) {
                ridToServerId[network.rid] = network.id;
                container[network.id] = [];
            }

            for (var link of links) {
                var server = ridToServerId[link.rid];
                if (!server) {
                    log.error("VectorIrcBackbone", "Could not find network for RID " + link.rid);
                    throw new Error("Unexpected RID");
                }

                container[server].push(link.channel);
            }

            return container;
        });
    }

    /*override*/
    getChannelOps(network, channel) {
        return this._getNetworks().then(networks => {
            var networkServer = null;
            var rid = null;
            for (var n of networks) {
                if (n.id === network) {
                    networkServer = n.domain;
                    rid = n.rid;
                    break;
                }
            }

            return VectorScalarClient.getIrcOperators(rid, networkServer, '#' + channel, this._scalarToken);
        });
    }

    /*override*/
    addChannel(network, channel, op) {
        return this._getNetworks().then(networks => {
            var networkServer = null;
            var rid = null;
            for (var n of networks) {
                if (n.id === network) {
                    networkServer = n.domain;
                    rid = n.rid;
                    break;
                }
            }

            return VectorScalarClient.addIrcLink(rid, this._roomId, networkServer, '#' + channel, op, this._scalarToken);
        });
    }

    /*override*/
    removeChannel(network, channel) {
        return this._getNetworks().then(networks => {
            var networkServer = null;
            var rid = null;
            for (var n of networks) {
                if (n.id === network) {
                    networkServer = n.domain;
                    rid = n.rid;
                    break;
                }
            }

            return VectorScalarClient.removeIrcLink(rid, this._roomId, networkServer, '#' + channel, this._scalarToken);
        });
    }

    _getNetworks() {
        if (this._lastNetworkResponse !== null) return Promise.resolve(this._lastNetworkResponse);
        return VectorScalarClient.getIrcNetworks(this._scalarToken).then(networks => {
            this._lastNetworkResponse = networks;
            return networks;
        });
    }
}

module.exports = VectorIrcBackbone;