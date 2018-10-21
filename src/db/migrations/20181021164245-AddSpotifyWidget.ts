import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_widgets", [
                {
                    type: "spotify",
                    name: "Spotify",
                    avatarUrl: "/img/avatars/spotify.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Share music with the room",
                }
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_widgets", {
                type: "spotify",
            }));
    }
}