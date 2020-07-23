import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_widgets", [
                {
                    type: "bigbluebutton",
                    name: "BigBlueButton",
                    avatarUrl: "/img/avatars/bigbluebutton.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Embed a BigBlueButton conference",
                }
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_widgets", {
                type: "bigbluebutton",
            }));
    }
}
