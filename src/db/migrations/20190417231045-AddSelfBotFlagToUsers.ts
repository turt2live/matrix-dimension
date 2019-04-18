import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.addColumn("dimension_users", "isSelfBot", {
                type: DataType.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.removeColumn("dimension_users", "isSelfBot"));
    }
}