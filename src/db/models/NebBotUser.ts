import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import AppServiceUser from "./AppServiceUser";
import NebIntegration from "./NebIntegration";

@Table({
    tableName: "dimension_neb_bot_users",
    underscored: false,
    timestamps: false,
})
export default class NebBotUser extends Model<NebBotUser> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    serviceId: string;

    @Column
    @ForeignKey(() => AppServiceUser)
    appserviceUserId: string;

    @Column
    @ForeignKey(() => NebIntegration)
    integrationId: number;
}