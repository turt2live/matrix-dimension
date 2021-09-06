import { QueryInterface } from "sequelize";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() =>
                queryInterface.sequelize.query(
                    "UPDATE dimension_appservice_users SET avatarUrl = REPLACE(avatarUrl, '/img/', '/assets/img/')"
                )
            )
            .then(() =>
                queryInterface.sequelize.query(
                    "UPDATE dimension_neb_integrations SET avatarUrl = REPLACE(avatarUrl, '/img/', '/assets/img/')"
                )
            );
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() =>
                queryInterface.sequelize.query(
                    "UPDATE dimension_appservice_users SET avatarUrl = REPLACE(avatarUrl, '/assets/img/', '/img/')"
                )
            )
            .then(() =>
                queryInterface.sequelize.query(
                    "UPDATE dimension_neb_integrations SET avatarUrl = REPLACE(avatarUrl, '/assets/img/', '/img/')"
                )
            );
    },
};
