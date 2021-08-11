import * as child_process from 'child_process';

let version = "Unknown";
let gitHash = null;

try {
    version = "v" + require("../package.json").version;
} catch (error) {
    // The log service isn't set up by the time we require this file
    console.error("version", error);
}

try {
    gitHash = child_process
    .execSync('git rev-parse --short HEAD')
    .toString().trim()
} catch (error) {
    // The log service isn't set up by the time we require this file
    console.error("version", error);
}

export const CURRENT_VERSION = version + (gitHash ? "-" + gitHash : "");
