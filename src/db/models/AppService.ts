import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "dimension_appservice",
    underscored: false,
    timestamps: false,
})
export default class AppService extends Model {
    @PrimaryKey
    @Column
    id: string;

    @Column
    hsToken: string;

    @Column
    asToken: string;

    @Column
    userPrefix: string;
}