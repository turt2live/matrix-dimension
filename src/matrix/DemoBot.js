var sdk = require("matrix-js-sdk");
var log = require("../util/LogService");

/**
 * Dimension demo bot. Doesn't do anything except show how to add a self-hosted bot to Dimension
 */
class DemoBot {

    constructor(homeserverUrl, userId, accessToken) {
        this._rooms = [];

        log.info("DemoBot", "Constructing bot as " + userId);
        this._client = sdk.createClient({
            baseUrl: homeserverUrl,
            accessToken: accessToken,
            userId: userId,
        });

        this._client.on('event', event => {
            if (event.getType() !== "m.room.member") return;
            if (event.getStateKey() != this._client.credentials.userId) return;
            if (event.getContent().membership === 'invite') {
                if (this._rooms.indexOf(event.getRoomId()) !== -1) return;
                log.info("DemoBot", "Joining " + event.getRoomId());
                this._client.joinRoom(event.getRoomId()).then(() => {
                    this._recalculateRooms();
                    this._client.sendMessage(event.getRoomId(), {
                        msgtype: "m.notice",
                        body: "Hello! I'm a small bot that acts as an example for how to set up your own bot on Dimension."
                    });
                });
            } else this._recalculateRooms();
        });
    }

    start() {
        log.info("DemoBot", "Starting bot");
        this._client.startClient();

        this._client.on('sync', state => {
            if (state == 'PREPARED') this._recalculateRooms();
        });
    }

    _recalculateRooms() {
        var rooms = this._client.getRooms();
        this._rooms = [];
        for (var room of rooms) {
            var me = room.getMember(this._client.credentials.userId);
            if (!me) continue;

            if (me.membership == "invite") {
                this._client.joinRoom(room.roomId);
                continue;
            }

            if (me.membership != "join") continue;
            this._rooms.push(room.roomId);
        }

        log.verbose("DemoBot", "Currently in " + this._rooms.length + " rooms");
    }

}

module.exports = DemoBot;