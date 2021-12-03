import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import Upstream from "./Upstream";
import { IHookshotBridgeRecord } from "./IHookshotBridgeRecord";

@Table({
    tableName: "dimension_hookshot_webhook_bridges",
    underscored: false,
    timestamps: false,
})
export default class HookshotWebhookBridgeRecord extends Model implements IHookshotBridgeRecord {
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
