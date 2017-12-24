import { LogService } from "matrix-js-snippets";
import * as git from "git-rev-sync";

let version = "Unknown";

try {
    version = "v" + require("../../package.json").version;
} catch (error) {
    LogService.error("version", error);
}

export const CURRENT_VERSION = version + "-" + git.short();
