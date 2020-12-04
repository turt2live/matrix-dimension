import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkInsert("dimension_widgets", [
                {
                    type: "whiteboard",
                    name: "Whiteboard",
                    avatarUrl: "/img/avatars/whiteboard.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "A whiteboard app embedded in the room.",
                    optionsJson: '{"defaultUrl":"https://cloud13.de/testwhiteboard/?whiteboardid=$roomId_$boardName"}',
                }
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkDelete("dimension_widgets", {
                type: "whiteboard",
            }));
    }
}
