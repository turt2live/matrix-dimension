var IntegrationStub = require("./IntegrationStub");

/**
 * Represents a bridge. Normally bridges have enhanced configuration and requirements over bots.
 */
class Bridge extends IntegrationStub {

    /**
     * Creates a new bridge
     * @param bridgeConfig the configuration for the bridge
     */
    constructor(bridgeConfig) {
        super(bridgeConfig);
    }

    /**
     * Registers the API routes for this bridge with the given app.
     * @param app the app to register the routes on
     */
    registerApi(app) {
        // nothing
    }

    /*override*/
    getUserId() {
        return null; // bridges don't have bot users we care about
    }
}

module.exports = Bridge;