import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_bridges", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "avatarUrl": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
                "isPublic": {type: DataType.BOOLEAN, allowNull: false},
            }))
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "irc",
                    name: "IRC Bridge",
                    avatarUrl: "/img/avatars/irc.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Bridges IRC channels to rooms, supporting multiple networks",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("dimension_bridges");
    }
}