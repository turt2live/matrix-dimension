import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    ForeignKey,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import Upstream from "./Upstream";

@Table({
    tableName: "dimension_terms_upstream",
    underscored: false,
    timestamps: false,
})
export default class TermsUpstreamRecord extends Model<TermsUpstreamRecord> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull
    @Column
    @ForeignKey(() => Upstream)
    upstreamId?: number;

    @BelongsTo(() => Upstream)
    upstream: Upstream;

    @Column
    url: string;
}