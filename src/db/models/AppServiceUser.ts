import { AllowNull, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import AppService from "./AppService";

@Table({
    tableName: "dimension_appservice_users",
    underscored: false,
    timestamps: false,
})
export default class AppServiceUser extends Model {
    @PrimaryKey
    @Column
    id: string;

    @Column
    accessToken: string;

    @AllowNull
    @Column
    avatarUrl?: string;

    @AllowNull
    @Column
    displayName?: string;

    @Column
    @ForeignKey(() => AppService)
    appserviceId: string;
}