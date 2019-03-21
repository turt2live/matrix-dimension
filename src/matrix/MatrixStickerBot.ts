import {
    AutojoinUpgradedRoomsMixin,
    MatrixClient,
    SimpleFsStorageProvider,
    SimpleRetryJoinStrategy
} from "matrix-bot-sdk";
import config from "../config";
import { LogService } from "matrix-js-snippets";

class _MatrixStickerBot {

    private client: MatrixClient;

    constructor() {
        this.client = new MatrixClient(
            config.homeserver.clientServerUrl,
            config.homeserver.accessToken,
            new SimpleFsStorageProvider(config.database.botData));

        this.client.setJoinStrategy(new SimpleRetryJoinStrategy());
        this.client.on("room.event", this.onEvent.bind(this));
        this.client.on("room.upgraded", this.onUpgraded.bind(this));
        AutojoinUpgradedRoomsMixin.setupOnClient(this.client);
    }

    public start(): Promise<any> {
        return this.client.start().then(() => LogService.info("MatrixStickerBot", "Sticker bot started"));
    }

    public getUserId(): Promise<string> {
        return this.client.getUserId();
    }

    private onEvent(roomId, event) {
        LogService.info("MatrixStickerBot", `Event ${event.type} in ${roomId}`);
    }

    private onUpgraded(roomId, event) {
        LogService.info("MatrixStickerBot", `Room ${roomId} upgraded due to ${event.type}`);
    }
}

export const MatrixStickerBot = new _MatrixStickerBot();