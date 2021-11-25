import * as child_process from 'child_process';

let version = process.env.npm_package_version ? "v" + process.env.npm_package_version : "Unknown";
let gitHash = null;

if (
    process.env.NODE_ENV === "development" ||
    process.env.TS_NODE_DEV === "true"
) {
    try {
        gitHash = child_process
            .execSync('git rev-parse --short HEAD')
            .toString().trim()
    } catch (error) {
        // The log service isn't set up by the time we require this file
        console.error("version", error);
    }
}

export const CURRENT_VERSION = version + (gitHash ? "-" + gitHash : "");
