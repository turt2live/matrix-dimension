import { Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./User";

@Table({
    tableName: "dimension_webhooks",
    underscored: false,
    timestamps: false,
})
export default class Webhook extends Model<Webhook> {
    // This is really just a holding class to keep foreign keys alive

    @PrimaryKey
    @Column
    hookId: string;

    @Column
    @ForeignKey(() => User)
    ownerUserId: string;

    @Column
    purposeId: string;

    @Column
    targetUrl: string;
}