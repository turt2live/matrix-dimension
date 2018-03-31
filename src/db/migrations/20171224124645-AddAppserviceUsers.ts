import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_appservice_users", {
                "id": {type: DataType.STRING, primaryKey: true, allowNull: false},
                "appserviceId": {
                    type: DataType.STRING, allowNull: false,
                    references: {model: "dimension_appservice", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "accessToken": {type: DataType.STRING, allowNull: false},
                "displayName": {type: DataType.STRING, allowNull: true},
                "avatarUrl": {type: DataType.STRING, allowNull: true},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("dimension_appservice_users");
    }
}