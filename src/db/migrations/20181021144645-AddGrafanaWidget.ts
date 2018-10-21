import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_widgets", [
                {
                    type: "grafana",
                    name: "Grafana",
                    avatarUrl: "/img/avatars/grafana.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Embed a graph in the room",
                }
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_widgets", {
                type: "grafana",
            }));
    }
}