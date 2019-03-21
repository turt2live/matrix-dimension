import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.addColumn("dimension_sticker_packs", "trackingRoomAlias", {
                type: DataType.STRING,
                allowNull: true
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.removeColumn("dimension_sticker_packs", "trackingRoomAlias"));
    }
}