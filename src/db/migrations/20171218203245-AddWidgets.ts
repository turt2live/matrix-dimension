import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_widgets", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "avatarUrl": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
                "isPublic": {type: DataType.BOOLEAN, allowNull: false},
                "optionsJson": {type: DataType.STRING, allowNull: true},
            }))
            .then(() => queryInterface.bulkInsert("dimension_widgets", [
                {
                    type: "custom",
                    name: "Custom Widget",
                    avatarUrl: "/img/avatars/customwidget.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "A webpage embedded in the room.",
                },
                {
                    type: "etherpad",
                    name: "Etherpad",
                    avatarUrl: "/img/avatars/etherpad.png",
                    isEnabled: true,
                    isPublic: true,
                    description: "Collaborate on documents with members of your room.",
                    optionsJson: '{"defaultUrl":"https://demo.riot.im/etherpad/p/$roomId_$padName"}',
                },
                {
                    type: "googlecalendar",
                    name: "Google Calendar",
                    isEnabled: true,
                    isPublic: true,
                    avatarUrl: "/img/avatars/googlecalendar.png",
                    description: "Share upcoming events in your room with a Google Calendar.",
                },
                {
                    type: "googledocs",
                    name: "Google Docs",
                    isEnabled: true,
                    isPublic: true,
                    avatarUrl: "/img/avatars/googledocs.png",
                    description: "Collaborate on and share documents using Google Docs.",
                },
                {
                    type: "youtube",
                    name: "YouTube Video",
                    isEnabled: true,
                    isPublic: true,
                    avatarUrl: "/img/avatars/youtube.png",
                    description: "Embed a YouTube, Vimeo, or DailyMotion video in your room.",
                },
                {
                    type: "twitch",
                    name: "Twitch Livestream",
                    isEnabled: true,
                    isPublic: true,
                    avatarUrl: "/img/avatars/twitch.png",
                    description: "Embed a Twitch livestream into your room.",
                },
                {
                    type: "jitsi",
                    name: "Jitsi Conference",
                    isEnabled: true,
                    isPublic: true,
                    avatarUrl: "/img/avatars/jitsi.png",
                    description: "Hold a video conference with Jitsi Meet",
                    optionsJson: '{"jitsiDomain":"jitsi.riot.im", "scriptUrl":"https://jitsi.riot.im/libs/external_api.min.js"}',
                },
            ]));
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("dimension_widgets");
    }
}