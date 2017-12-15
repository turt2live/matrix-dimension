/**
 * Stubbed/placeholder CircleCI backbone
 */
class StubbedCircleCiBackbone {

    /**
     * Creates a new stubbed CircleCI backbone
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
     * Gets the repository templates for this backbone
     * @returns {Promise<{repoKey:string,template:string}[]>} resolves to the collection of repositories and their templates
     */
    getRepos() {
        throw new Error("Not implemented");
    }

    /**
     * Gets the immutable repository templates for this backbone (set by other users)
     * @returns {Promise<{repoKey:string,template:string,ownerId:string}[]>} resolves to the collection of repositories and their templates
     */
    getImmutableRepos() {
        throw new Error("Not implemented");
    }

    /**
     * Sets the new repository templates for this backbone
     * @param {{repoKey:string,template:string}[]} newRepos the new templates for the repositories
     * @returns {Promise<>} resolves when complete
     */
    setRepos(newRepos) {
        throw new Error("Not implemented");
    }

    /**
     * Gets the webhook url for this backbone
     * @returns {Promise<string>} resolves to the webhook URL
     */
    getWebhookUrl() {
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

module.exports = StubbedCircleCiBackbone;