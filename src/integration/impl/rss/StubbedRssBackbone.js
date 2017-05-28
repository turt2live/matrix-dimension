/**
 * Stubbed/placeholder RSS backbone
 */
class StubbedRssBackbone {

    /**
     * Creates a new stubbed RSS backbone
     */
    constructor() {
    }

    /**
     * Gets the user ID for this backbone
     * @returns {Promise<string>} resolves to the user ID
     */
    getUserId() {
        throw new Error("Not implemented");
    }

    /**
     * Gets the feeds for this backbone
     * @returns {Promise<string[]>} resolves to the collection of feeds
     */
    getFeeds() {
        throw new Error("Not implemented");
    }
}

module.exports = StubbedRssBackbone;