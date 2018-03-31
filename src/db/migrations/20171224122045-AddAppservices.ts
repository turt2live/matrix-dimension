import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_appservice", {
                "id": {type: DataType.STRING, primaryKey: true, allowNull: false},
                "hsToken": {type: DataType.STRING, allowNull: false},
                "asToken": {type: DataType.STRING, allowNull: false},
                "userPrefix": {type: DataType.STRING, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("dimension_appservice");
    }
}