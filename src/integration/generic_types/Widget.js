var IntegrationStub = require("./IntegrationStub");

/**
 * Represents a widget. Widgets allow for web applications or rich functionality within the room.
 */
class Widget extends IntegrationStub {

    /**
     * Creates a new widget
     * @param widgetConfig the configuration for the widget
     */
    constructor(widgetConfig) {
        super(widgetConfig);
    }

    /*override*/
    getUserId() {
        return null; // widgets don't have bot users we care about
    }
}

module.exports = Widget;