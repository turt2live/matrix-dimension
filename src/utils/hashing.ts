import * as crypto from "crypto";

export function md5(text: string): string {
    return crypto.createHash("md5").update(text).digest('hex').toLowerCase();
}

export function sha256(text: string): string {
    return crypto.createHash("sha256").update(text).digest('hex').toLowerCase();
}
