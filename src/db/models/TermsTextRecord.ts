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
import TermsRecord from "./TermsRecord";

@Table({
    tableName: "dimension_terms_text",
    underscored: false,
    timestamps: false,
})
export default class TermsTextRecord extends Model<TermsTextRecord> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull
    @Column
    @ForeignKey(() => TermsRecord)
    termsId?: number;

    @BelongsTo(() => TermsRecord)
    terms: TermsRecord;

    @Column
    language: string;

    @Column
    url: string;

    @Column
    name: string;

    @AllowNull
    @Column
    text?: string;
}