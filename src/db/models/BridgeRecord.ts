import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { IntegrationRecord } from "./IntegrationRecord";

@Table({
    tableName: "dimension_bridges",
    underscored: false,
    timestamps: false,
})
export default class BridgeRecord extends Model<BridgeRecord> implements IntegrationRecord {
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
}