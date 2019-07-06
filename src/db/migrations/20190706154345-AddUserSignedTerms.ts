import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_terms_signed", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "termsId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_terms", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "userId": {
                    type: DataType.STRING, allowNull: false,
                    references: {model: "dimension_users", key: "userId"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_terms_signed"));
    }
}