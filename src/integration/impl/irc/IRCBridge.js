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
}

module.exports = IRCBridge;