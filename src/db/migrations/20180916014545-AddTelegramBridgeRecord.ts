import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_bridges", [
                {
                    type: "telegram",
                    name: "Telegram Bridge",
                    avatarUrl: "/img/avatars/telegram.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Bridges Telegram chats and channels to rooms on Matrix",
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_bridges", {
                type: "telegram",
            }));
    }
}