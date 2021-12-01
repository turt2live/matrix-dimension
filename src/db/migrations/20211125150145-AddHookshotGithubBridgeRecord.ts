import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "hookshot_github",
                    name: "Github Bridge",
                    avatarUrl: "/assets/img/avatars/github.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Bridges Github issues to Matrix",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "hookshot_github",
            }));
    }
}
