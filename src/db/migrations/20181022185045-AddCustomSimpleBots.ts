import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_custom_simple_bots", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "avatarUrl": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
                "isPublic": {type: DataType.BOOLEAN, allowNull: false},
                "userId": {type: DataType.STRING, allowNull: false},
                "accessToken": {type: DataType.STRING, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_custom_simple_bots"));
    }
}