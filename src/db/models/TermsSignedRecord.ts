import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./User";
import TermsRecord from "./TermsRecord";

@Table({
    tableName: "dimension_terms_signed",
    underscored: false,
    timestamps: false,
})
export default class TermsSignedRecord extends Model<TermsSignedRecord> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull
    @Column
    @ForeignKey(() => TermsRecord)
    termsId?: number;

    @AllowNull
    @Column
    @ForeignKey(() => User)
    userId?: string;
}