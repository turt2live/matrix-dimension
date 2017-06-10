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
}

module.exports = StubbedIrcBackbone;