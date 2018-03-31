import {
    AllowNull, AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey,
    Table
} from "sequelize-typescript";
import User from "./User";
import Upstream from "./Upstream";

@Table({
    tableName: "dimension_scalar_tokens",
    underscoredAll: false,
    timestamps: false,
})
export default class UserScalarToken extends Model<UserScalarToken> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    @ForeignKey(() => User)
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @Column
    scalarToken: string;

    @Column
    isDimensionToken: boolean;

    @AllowNull
    @Column
    @ForeignKey(() => Upstream)
    upstreamId?: number;
}