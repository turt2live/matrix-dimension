var Bridge = require("../../generic_types/Bridge");

/**
 * Represents an IRC bridge
 */
class IRCBridge extends Bridge {

    /**
     * Creates a new IRC bridge
     * @param bridgeConfig the bridge configuration
     * @param backbone the backbone powering this bridge
     */
    constructor(bridgeConfig, backbone) {
        super(bridgeConfig);
        this._backbone = backbone;
    }

    /*override*/
    getState() {
        var response = {
            availableNetworks: [],
            channels: {}
        };
        return this._backbone.getNetworks().then(networks => {
            response.availableNetworks = networks;
            return this._backbone.getLinkedChannels();
        }).then(channels => {
            response.channels = channels;
            return response;
        });
    }

    /*override*/
    removeFromRoom(roomId) {
        return this._backbone.removeFromRoom(roomId);
    }

    /*override*/
    updateState(newState) {
        throw new Error("State cannot be updated for an IRC bridge. Use the IRC API instead.");
    }

    /**
     * Gets a list of operators available in a particular channel on a particular network
     * @param {string} network the network to look at
     * @param {string} channel the channel to look in (without prefixed #)
     * @returns {Promise<string[]>} resolves to a list of operators
     */
    getChannelOps(network, channel) {
        return this._backbone.getChannelOps(network, channel);
    }

    /**
     * Links a channel to the room this bridge controls
     * @param {string} network the network to link to
     * @param {string} channel the channel to link to
     * @param {string} op the channel operator to request permission from
     * @returns {Promise<>} resolves when complete
     */
    addChannel(network, channel, op) {
        return this._backbone.addChannel(network, channel, op);
    }

    /**
     * Unlinks a channel from the room this bridge controls
     * @param {string} network the network to unlink from
     * @param {string} channel the channel to unlink
     * @returns {Promise<>} resolves when complete
     */
    removeChannel(network, channel) {
        return this._backbone.removeChannel(network, channel);
    }
}

module.exports = IRCBridge;