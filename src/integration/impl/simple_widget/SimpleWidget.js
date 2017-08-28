var Widget = require("../../generic_types/Widget");

/**
 * Represents a simple widget
 */
class SimpleWidget extends Widget {

    /**
     * Creates a new simple widget
     * @param widgetConfig the widget configuration
     */
    constructor(widgetConfig) {
        super(widgetConfig);
    }
}

module.exports = SimpleWidget;