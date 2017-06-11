/**
 * Stubbed/placeholder IRC backbone
 */
class StubbedIrcBackbone {

    /**
     * Creates a new stubbed IRC backbone
     */
    constructor() {
    }

    /**
     * Gets a list of all available networks
     * @returns {Promise<{name: string, id: string}[]>} resolves to the list of available networks
     */
    getNetworks() {
        return Promise.resolve([]);
    }

    /**
     * Gets a network representation of the linked channels
     * @returns {Promise<{[string]: string[]}>} resolves to the network representation of linked channels
     */
    getLinkedChannels() {
        return Promise.resolve({});
    }

    /**
     * Gets a list of operators available in a particular channel on a particular network
     * @param {string} network the network to look at
     * @param {string} channel the channel to look in (without prefixed #)
     * @returns {Promise<string[]>} resolves to a list of operators
     */
    getChannelOps(network, channel) {
        return Promise.resolve([]);
    }

    /**
     * Links a channel to the room this backbone controls
     * @param {string} network the network to link to
     * @param {string} channel the channel to link to
     * @param {string} op the channel operator to request permission from
     * @returns {Promise<>} resolves when complete
     */
    addChannel(network, channel, op) {
        throw new Error("Not implemented");
    }

    /**
     * Unlinks a channel from the room this backbone controls
     * @param {string} network the network to unlink from
     * @param {string} channel the channel to unlink
     * @returns {Promise<>} resolves when complete
     */
    removeChannel(network, channel) {
        throw new Error("Not implemented");
    }
}

module.exports = StubbedIrcBackbone;