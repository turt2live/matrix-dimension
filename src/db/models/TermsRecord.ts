import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import TermsTextRecord from "./TermsTextRecord";

@Table({
    tableName: "dimension_terms",
    underscored: false,
    timestamps: false,
})
export default class TermsRecord extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    shortcode: string;

    @Column
    version: string;

    @HasMany(() => TermsTextRecord)
    texts: TermsTextRecord[];
}