import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "dimension_upstreams",
    underscored: false,
    timestamps: false,
})
export default class Upstream extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column
    type: string;

    @Column
    scalarUrl: string;

    @Column
    apiUrl: string;
}