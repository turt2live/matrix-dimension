import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "hookshot_webhook",
                    name: "Webhooks Bridge",
                    avatarUrl: "/assets/img/avatars/webhooks.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Webhooks to Matrix",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "hookshot_webhook",
            }));
    }
}
