import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkUpdate("dimension_bridges", {
                name: "Webhooks Bridge",
            }, { type: "webhooks" }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.bulkUpdate("dimension_bridges", {
                name: "Webhook Bridge",
            }, { type: "webhooks" }));
    }
}
