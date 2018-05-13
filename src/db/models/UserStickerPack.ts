import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import StickerPack from "./StickerPack";
import User from "./User";

@Table({
    tableName: "dimension_user_sticker_packs",
    underscoredAll: false,
    timestamps: false,
})
export default class UserStickerPack extends Model<UserStickerPack> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    @ForeignKey(() => StickerPack)
    packId: number;

    @Column
    @ForeignKey(() => User)
    userId: string;

    @Column
    isSelected: boolean;
}