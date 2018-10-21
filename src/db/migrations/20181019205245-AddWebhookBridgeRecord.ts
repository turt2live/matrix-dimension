import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "webhooks",
                    name: "Webhook Bridge",
                    avatarUrl: "/img/avatars/webhooks.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Slack-compatible webhooks for your room",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "webhooks",
            }));
    }
}