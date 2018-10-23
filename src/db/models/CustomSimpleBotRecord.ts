import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { IntegrationRecord } from "./IntegrationRecord";

@Table({
    tableName: "dimension_custom_simple_bots",
    underscoredAll: false,
    timestamps: false,
})
export default class CustomSimpleBotRecord extends Model<CustomSimpleBotRecord> implements IntegrationRecord {
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
    userId: string;

    @Column
    accessToken: string;
}