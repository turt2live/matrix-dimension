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

class _DimensionStore {
    private sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            database: "dimension",
            storage: config.database.file,
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