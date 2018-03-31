import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_neb_configurations", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "appserviceId": {
                    type: DataType.STRING, allowNull: true,
                    references: {model: "dimension_appservice", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "upstreamId": {
                    type: DataType.INTEGER, allowNull: true,
                    references: {model: "dimension_upstreams", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "adminUrl": {type: DataType.STRING, allowNull: true},
            }))
            .then(() => queryInterface.createTable("dimension_neb_integrations", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "avatarUrl": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
                "isPublic": {type: DataType.BOOLEAN, allowNull: false},
                "nebId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_neb_configurations", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
            }))
            .then(() => queryInterface.createTable("dimension_neb_bot_users", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "serviceId": {type: DataType.STRING, allowNull: false},
                "appserviceUserId": {
                    type: DataType.STRING, allowNull: false,
                    references: {model: "dimension_appservice_users", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "integrationId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_neb_integrations", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
            }))
            .then(() => queryInterface.createTable("dimension_neb_notification_users", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "serviceId": {type: DataType.STRING, allowNull: false},
                "ownerId": {
                    type: DataType.STRING, allowNull: false,
                    references: {model: "dimension_users", key: "userId"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "appserviceUserId": {
                    type: DataType.STRING, allowNull: false,
                    references: {model: "dimension_appservice_users", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "integrationId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_neb_integrations", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_neb_notification_users"))
            .then(() => queryInterface.dropTable("dimension_neb_bot_users"))
            .then(() => queryInterface.dropTable("dimension_neb_integrations"))
            .then(() => queryInterface.dropTable("dimension_neb_configurations"));
    }
}