import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import Upstream from "./Upstream";

@Table({
    tableName: "dimension_telegram_bridges",
    underscoredAll: false,
    timestamps: false,
})
export default class TelegramBridgeRecord extends Model<TelegramBridgeRecord> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull
    @Column
    @ForeignKey(() => Upstream)
    upstreamId?: number;

    @AllowNull
    @Column
    provisionUrl?: string;

    @AllowNull
    @Column
    sharedSecret?: string;

    @AllowNull
    @Column
    allowTgPuppets?: boolean;

    @AllowNull
    @Column
    allowMxPuppets?: boolean;

    @Column
    isEnabled: boolean;
}