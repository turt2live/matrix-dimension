import { Sequelize } from "sequelize-typescript";
import config from "../config";
import { LogService } from "matrix-bot-sdk";
import User from "./models/User";
import UserScalarToken from "./models/UserScalarToken";
import Upstream from "./models/Upstream";
import WidgetRecord from "./models/WidgetRecord";
import * as path from "path";
import { SequelizeStorage, Umzug } from "umzug";
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
import CustomSimpleBotRecord from "./models/CustomSimpleBotRecord";
import SlackBridgeRecord from "./models/SlackBridgeRecord";
import TermsRecord from "./models/TermsRecord";
import TermsTextRecord from "./models/TermsTextRecord";
import TermsSignedRecord from "./models/TermsSignedRecord";
import TermsUpstreamRecord from "./models/TermsUpstreamRecord";
import HookshotGithubBridgeRecord from "./models/HookshotGithubBridgeRecord";

class _DimensionStore {
    private sequelize: Sequelize;

    constructor() {
        if (process.env.DATABASE_URI || config.database.uri ) {
            this.sequelize = new Sequelize(process.env.DATABASE_URI || config.database.uri , {
                logging: i => LogService.debug("DimensionStore [SQL]", i)
            });
        } else {
            this.sequelize = new Sequelize({
                dialect: 'sqlite',
                database: "dimension",
                storage: process.env['DIMENSION_DB_PATH'] || config.database.file,
                username: "",
                password: "",
                logging: i => LogService.debug("DimensionStore [SQL]", i)
            });
        }
        this.sequelize.addModels([
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
            CustomSimpleBotRecord,
            SlackBridgeRecord,
            TermsRecord,
            TermsTextRecord,
            TermsSignedRecord,
            TermsUpstreamRecord,
            HookshotGithubBridgeRecord,
        ]);
    }

    public updateSchema(): Promise<any> {
        LogService.info("DimensionStore", "Updating schema...",);

        const migrator = new Umzug({
            migrations: {
                glob: path.join(__dirname, "migrations/*.{js,ts}"),
                resolve: ({name, path, context}) => {
                    // Adjust the migration from the new signature to the v2 signature, making easier to upgrade to v3
                    const migration = require(path)
                    return { name, up: async () => migration.default.up(context), down: async () => migration.default.down(context) }
                }
            },
            context: this.sequelize.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize: this.sequelize }),
            logger: console
        });

        return migrator.up();
    }
}

export const DimensionStore = new _DimensionStore();
