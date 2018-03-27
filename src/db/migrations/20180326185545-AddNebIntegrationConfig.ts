import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_neb_integration_config", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "integrationId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_neb_integrations", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "roomId": {type: DataType.STRING, allowNull: false},
                "jsonContent": {type: DataType.STRING, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_neb_integration_config"));
    }
}