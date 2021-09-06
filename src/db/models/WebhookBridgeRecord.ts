import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import Upstream from "./Upstream";

@Table({
    tableName: "dimension_webhook_bridges",
    underscored: false,
    timestamps: false,
})
export default class WebhookBridgeRecord extends Model {
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

    @Column
    isEnabled: boolean;
}