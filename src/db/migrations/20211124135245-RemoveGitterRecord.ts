import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "gitter",
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "gitter",
                    name: "Gitter Bridge",
                    avatarUrl: "/assets/img/avatars/gitter.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Bridges Gitter rooms to Matrix",
                },
            ]));
    }
}
