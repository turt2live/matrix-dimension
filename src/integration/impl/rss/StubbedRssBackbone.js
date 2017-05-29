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

    /**
     * Sets the new feeds for this backbone
     * @param {string[]} newFeeds the new feed URLs
     * @returns {Promise<>} resolves when complete
     */
    setFeeds(newFeeds) {
        throw new Error("Not implemented");
    }

    /**
     * Gets the immutable feeds for this backbone
     * @returns {Promise<{url:string,ownerId:string}>} resolves to the collection of immutable feeds
     */
    getImmutableFeeds() {
        throw new Error("Not implemented");
    }

    /**
     * Removes the bot from the given room
     * @param {string} roomId the room ID to remove the bot from
     * @returns {Promise<>} resolves when completed
     */
    removeFromRoom(roomId) {
        throw new Error("Not implemented");
    }
}

module.exports = StubbedRssBackbone;