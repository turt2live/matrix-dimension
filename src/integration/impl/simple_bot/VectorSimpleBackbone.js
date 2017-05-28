/**
 * Stubbed/placeholder simple bot backbone
 */
class StubbedSimpleBackbone {

    /**
     * Creates a new stubbed RSS backbone
     */
    constructor() {
    }

    /**
     * Leaves a given Matrix room
     * @param {string} roomId the room to leave
     * @returns {Promise<>} resolves when completed
     */
    leaveRoom(roomId) {
        throw new Error("Not implemented");
    }
}

module.exports = StubbedRssBackbone;