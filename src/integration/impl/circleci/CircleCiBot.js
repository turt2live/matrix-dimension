var ComplexBot = require("../../generic_types/ComplexBot");

/**
 * Represents a CircleCI bot
 */
class CircleCiBot extends ComplexBot {

    /**
     * Creates a new CircleCI bot
     * @param botConfig the bot configuration
     * @param backbone the backbone powering this bot
     */
    constructor(botConfig, backbone) {
        super(botConfig);
        this._backbone = backbone;
    }

    /*override*/
    getUserId() {
        return this._backbone.getUserId();
    }

    /*override*/
    getState() {
        var response = {
            repoTemplates: [],
            immutableRepoTemplates: [],
            webhookUrl: ""
        };
        return this._backbone.getRepos().then(templates => {
            response.repoTemplates = templates;
            return this._backbone.getImmutableRepos();
        }).then(immutable => {
            response.immutableRepoTemplates = immutable;
            return this._backbone.getWebhookUrl();
        }).then(url => {
            response.webhookUrl = url;
            return response;
        });
    }

    /*override*/
    removeFromRoom(roomId) {
        return this._backbone.removeFromRoom(roomId);
    }

    /*override*/
    updateState(newState) {
        return this._backbone.setRepos(newState.repoTemplates).then(() => this.getState());
    }
}

module.exports = CircleCiBot;