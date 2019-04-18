import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "dimension_users",
    underscoredAll: false,
    timestamps: false,
})
export default class User extends Model<User> {
    // This is really just a holding class to keep foreign keys alive

    @PrimaryKey
    @Column
    userId: string;

    @Column
    isSelfBot: boolean;
}