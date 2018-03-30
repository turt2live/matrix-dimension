import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_webhooks", {
                "hookId": {type: DataType.STRING, primaryKey: true, allowNull: false},
                "ownerUserId": {
                    type: DataType.STRING, allowNull: false,
                    references: {model: "dimension_users", key: "userId"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "purposeId": {type: DataType.STRING, allowNull: false},
                "targetUrl": {type: DataType.STRING, allowNull: true},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_webhooks"));
    }
}