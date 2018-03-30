import * as git from "git-rev-sync";

let version = "Unknown";
let gitHash = null;

try {
    version = "v" + require("../../package.json").version;
} catch (error) {
    // The log service isn't set up by the time we require this file
    console.error("version", error);
}

try {
    gitHash = git.short();
} catch (error) {
    // The log service isn't set up by the time we require this file
    console.error("version", error);
}

export const CURRENT_VERSION = version + (gitHash ? "-" + gitHash : "");
