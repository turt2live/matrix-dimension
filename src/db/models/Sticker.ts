import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import StickerPack from "./StickerPack";

@Table({
    tableName: "dimension_stickers",
    underscored: false,
    timestamps: false,
})
export default class Sticker extends Model<Sticker> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column
    description: string;

    @Column
    imageMxc: string;

    @Column
    thumbnailMxc: string;

    @Column
    thumbnailWidth: number;

    @Column
    thumbnailHeight: number;

    @Column
    mimetype: string;

    @Column
    blurhash?: string;

    @Column
    @ForeignKey(() => StickerPack)
    packId: number;
}