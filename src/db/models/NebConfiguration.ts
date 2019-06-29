import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import Upstream from "./Upstream";
import AppService from "./AppService";

@Table({
    tableName: "dimension_neb_configurations",
    underscored: false,
    timestamps: false,
})
export default class NebConfiguration extends Model<NebConfiguration> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull
    @Column
    adminUrl?: string;

    @AllowNull
    @Column
    @ForeignKey(() => AppService)
    appserviceId?: string;

    @AllowNull
    @Column
    @ForeignKey(() => Upstream)
    upstreamId?: number;
}