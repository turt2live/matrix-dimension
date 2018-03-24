import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_users", {
                "userId": {type: DataType.STRING, primaryKey: true, allowNull: false},
            }))
            .then(() => queryInterface.createTable("dimension_upstreams", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "scalarUrl": {type: DataType.STRING, allowNull: false},
                "apiUrl": {type: DataType.STRING, allowNull: false},
            }))
            .then(() => queryInterface.createTable("dimension_scalar_tokens", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "userId": {
                    type: DataType.STRING,
                    allowNull: false,
                    references: {model: "dimension_users", key: "userId"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "scalarToken": {type: DataType.STRING, allowNull: false},
                "isDimensionToken": {type: DataType.BOOLEAN, allowNull: false},
                "upstreamId": {
                    type: DataType.INTEGER,
                    allowNull: true,
                    references: {model: "dimension_upstreams", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_users"))
            .then(() => queryInterface.dropTable("dimension_upstreams"))
            .then(() => queryInterface.dropTable("dimension_scalar_tokens"));
    }
}