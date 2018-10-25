import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "slack",
                    name: "Slack Bridge",
                    avatarUrl: "/img/avatars/slack.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Bridges Slack channels to Matrix",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "slack",
            }));
    }
}