import { Model, Sequelize } from "sequelize-typescript";
import config from "../config";
import { LogService } from "matrix-js-snippets";
import User from "./models/User";
import UserScalarToken from "./models/UserScalarToken";
import Upstream from "./models/Upstream";
import WidgetRecord from "./models/WidgetRecord";
import * as path from "path";
import * as Umzug from "umzug";
import AppService from "./models/AppService";
import AppServiceUser from "./models/AppServiceUser";
import NebConfiguration from "./models/NebConfiguration";
import NebIntegration from "./models/NebIntegration";
import NebBotUser from "./models/NebBotUser";
import NebNotificationUser from "./models/NebNotificationUser";
import NebIntegrationConfig from "./models/NebIntegrationConfig";
import Webhook from "./models/Webhook";
import BridgeRecord from "./models/BridgeRecord";
import IrcBridgeRecord from "./models/IrcBridgeRecord";
import IrcBridgeNetwork from "./models/IrcBridgeNetwork";
import StickerPack from "./models/StickerPack";
import Sticker from "./models/Sticker";
import UserStickerPack from "./models/UserStickerPack";
import TelegramBridgeRecord from "./models/TelegramBridgeRecord";
import WebhookBridgeRecord from "./models/WebhookBridgeRecord";
import GitterBridgeRecord from "./models/GitterBridgeRecord";
import CustomSimpleBotRecord from "./models/CustomSimpleBotRecord";
import SlackBridgeRecord from "./models/SlackBridgeRecord";

class _DimensionStore {
    private sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            database: "dimension",
            storage: process.env['DIMENSION_DB_PATH'] || config.database.file,
            username: "",
            password: "",
            logging: i => LogService.verbose("DimensionStore [SQL]", i)
        });
        this.sequelize.addModels(<Array<typeof Model>>[
            User,
            UserScalarToken,
            Upstream,
            WidgetRecord,
            AppService,
            AppServiceUser,
            NebConfiguration,
            NebIntegration,
            NebBotUser,
            NebNotificationUser,
            NebIntegrationConfig,
            Webhook,
            BridgeRecord,
            IrcBridgeRecord,
            IrcBridgeNetwork,
            StickerPack,
            Sticker,
            UserStickerPack,
            TelegramBridgeRecord,
            WebhookBridgeRecord,
            GitterBridgeRecord,
            CustomSimpleBotRecord,
            SlackBridgeRecord,
        ]);
    }

    public updateSchema(): Promise<any> {
        LogService.info("DimensionStore", "Updating schema...");

        const migrator = new Umzug({
            storage: "sequelize",
            storageOptions: {sequelize: this.sequelize},
            migrations: {
                params: [this.sequelize.getQueryInterface()],
                path: path.join(__dirname, "migrations"),
            }
        });

        return migrator.up();
    }
}

export const DimensionStore = new _DimensionStore();