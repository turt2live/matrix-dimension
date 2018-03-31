import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import IrcBridgeRecord from "./IrcBridgeRecord";

@Table({
    tableName: "dimension_irc_bridge_networks",
    underscoredAll: false,
    timestamps: false,
})
export default class IrcBridgeNetwork extends Model<IrcBridgeNetwork> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull
    @Column
    @ForeignKey(() => IrcBridgeRecord)
    bridgeId: number;

    @Column
    isEnabled: boolean;

    @Column
    bridgeNetworkId: string; // the real ID as given by /querynetworks

    @Column
    bridgeUserId: string;

    @Column
    displayName: string;

    @Column
    domain: string;
}