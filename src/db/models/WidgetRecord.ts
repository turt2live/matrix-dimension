import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { IntegrationRecord } from "./IntegrationRecord";

@Table({
    tableName: "dimension_widgets",
    underscored: false,
    timestamps: false,
})
export default class WidgetRecord extends Model<WidgetRecord> implements IntegrationRecord {
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
    optionsJson: string;
}