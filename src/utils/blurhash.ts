import { Sharp } from "sharp";
import { encode } from "blurhash";

export const BLURHASH_X_COMPONENTS = 4;
export const BLURHASH_Y_COMPONENTS = 4;
export const BLURHASH_SIZE = 32;


export const sharpToBlurhash = async (image: Sharp): Promise<string> => {
    const { data, info } = await image.raw()
        .ensureAlpha()
        .resize(BLURHASH_SIZE, BLURHASH_SIZE, { fit: "inside" })
        .toBuffer({ resolveWithObject: true });
    return encode(new Uint8ClampedArray(data), info.width, info.height, BLURHASH_X_COMPONENTS, BLURHASH_Y_COMPONENTS);
};