import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import AppServiceUser from "./AppServiceUser";
import NebIntegration from "./NebIntegration";
import User from "./User";

@Table({
    tableName: "dimension_neb_notification_users",
    underscoredAll: false,
    timestamps: false,
})
export default class NebNotificationUser extends Model<NebNotificationUser> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    serviceId: string;

    @Column
    @ForeignKey(() => User)
    ownerId: string;

    @Column
    @ForeignKey(() => AppServiceUser)
    appserviceUserId: string;

    @Column
    @ForeignKey(() => NebIntegration)
    integrationId: number;
}