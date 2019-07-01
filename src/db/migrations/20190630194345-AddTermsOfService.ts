import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_terms", {
                // Ideally we'd use a composite primary key here, but that's not really possible with our libraries.
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "shortcode": {type: DataType.STRING, allowNull: false},
                "version": {type: DataType.STRING, allowNull: false},
            }))
            .then(() => queryInterface.createTable("dimension_terms_text", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "termsId": {
                    type: DataType.INTEGER, allowNull: true,
                    references: {model: "dimension_terms", key: "id"},
                    onUpdate: "cascade", onDelete: "cascade",
                },
                "language": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "text": {type: DataType.STRING, allowNull: true},
                "url": {type: DataType.STRING, allowNull: false},
            }));
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_terms"))
            .then(() => queryInterface.dropTable("dimension_terms_text"));
    }
}