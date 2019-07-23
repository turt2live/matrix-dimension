import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_terms_upstream", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "upstreamId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_upstreams", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "url": {type: DataType.STRING, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_terms_upstream"));
    }
}