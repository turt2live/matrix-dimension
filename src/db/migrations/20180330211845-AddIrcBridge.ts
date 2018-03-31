import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_irc_bridges", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "upstreamId": {
                    type: DataType.INTEGER, allowNull: true,
                    references: {model: "dimension_upstreams", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "provisionUrl": {type: DataType.STRING, allowNull: true},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
            }))
            .then(() => queryInterface.createTable("dimension_irc_bridge_networks", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "bridgeId": {
                    type: DataType.INTEGER, allowNull: false,
                    references: {model: "dimension_irc_bridges", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "bridgeNetworkId": {type: DataType.STRING, allowNull: false},
                "bridgeUserId": {type: DataType.STRING, allowNull: false},
                "displayName": {type: DataType.STRING, allowNull: false},
                "domain": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_irc_bridges"))
            .then(() => queryInterface.dropTable("dimension_irc_bridge_networks"));
    }
}