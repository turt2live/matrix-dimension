import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.removeColumn("dimension_telegram_bridges", "allowPuppets"))
            .then(() => queryInterface.addColumn("dimension_telegram_bridges", "allowTgPuppets", DataType.BOOLEAN))
            .then(() => queryInterface.addColumn("dimension_telegram_bridges", "allowMxPuppets", DataType.BOOLEAN));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.removeColumn("dimension_telegram_bridges", "allowTgPuppets"))
            .then(() => queryInterface.removeColumn("dimension_telegram_bridges", "allowMxPuppets"))
            .then(() => queryInterface.addColumn("dimension_telegram_bridges", "allowPuppets", DataType.BOOLEAN));
    }
}