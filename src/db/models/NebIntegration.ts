import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { IntegrationRecord } from "./IntegrationRecord";
import NebConfiguration from "./NebConfiguration";

@Table({
    tableName: "dimension_neb_integrations",
    underscored: false,
    timestamps: false,
})
export default class NebIntegration extends Model implements IntegrationRecord {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    type: string;

    @Column
    name: string;

    @Column
    avatarUrl: string;

    @Column
    description: string;

    @Column
    isEnabled: boolean;

    @Column
    isPublic: boolean;

    @Column
    @ForeignKey(() => NebConfiguration)
    nebId: number;
}