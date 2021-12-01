import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "hookshot_jira",
                    name: "Jira Bridge",
                    avatarUrl: "/assets/img/avatars/jira.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Bridges Jira issues to Matrix",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "hookshot_jira",
            }));
    }
}
