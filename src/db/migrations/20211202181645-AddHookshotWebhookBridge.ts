import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_hookshot_webhook_bridges", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "upstreamId": {
                    type: DataType.INTEGER, allowNull: true,
                    references: {model: "dimension_upstreams", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "provisionUrl": {type: DataType.STRING, allowNull: true},
                "sharedSecret": {type: DataType.STRING, allowNull: true},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_hookshot_webhook_bridges"));
    }
}
