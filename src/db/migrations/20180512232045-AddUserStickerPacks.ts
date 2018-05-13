import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("dimension_user_sticker_packs", {
            "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
            "packId": {
                type: DataType.INTEGER, allowNull: false,
                references: {model: "dimension_sticker_packs", key: "id"},
                onUpdate: "cascade", onDelete: "cascade",
            },
            "userId": {
                type: DataType.STRING, allowNull: false,
                references: {model: "dimension_users", key: "userId"},
                onUpdate: "cascade", onDelete: "cascade",
            },
            "isSelected": {type: DataType.BOOLEAN, allowNull: false},
        })
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("dimension_user_sticker_packs");
    }
}