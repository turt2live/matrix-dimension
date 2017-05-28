var config = require("config");
var log = require("../util/LogService");
var fs = require("fs");
var path = require("path");
var _ = require("lodash");

log.info("Integrations", "Discovering integrations");

var searchPath = path.join(process.cwd(), "config", "integrations");
var files = _.filter(fs.readdirSync(searchPath), f => !fs.statSync(path.join(searchPath, f)).isDirectory() && f.endsWith(".yaml"));
var currentEnv = config.util.initParam("NODE_ENV", "development");

if (currentEnv !== "development" && currentEnv !== "production")
    throw new Error("Unknown node environment: " + currentEnv);

var configs = {};

for (var file of files) {
    if (file.endsWith("_development.yaml") || file.endsWith("_production.yaml")) {
        if (!file.endsWith("_" + currentEnv + ".yaml")) continue;
        var fileName = file.replace("_development.yaml", "").replace("_production.yaml", "") + ".yaml";

        if (!configs[fileName]) configs[fileName] = {};
        configs[fileName]["alt"] = config.util.parseFile(path.join(searchPath, file));
    } else {
        if (!configs[file]) configs[file] = {};
        configs[file]["defaults"] = config.util.parseFile(path.join(searchPath, file));
    }
}

var keys = _.keys(configs);
log.info("Integrations", "Discovered " + keys.length + " integrations. Parsing definitions...");

var linear = [];
var byUserId = {};
var byType = {};

for (var key of keys) {
    log.info("Integrations", "Preparing " + key);
    var merged = config.util.extendDeep(configs[key].defaults, configs[key].alt);
    if (!merged['enabled']) {
        log.warn("Integrations", "Integration " + key + " is not enabled - skipping");
        continue;
    }

    linear.push(merged);
    if (merged['userId'])
        byUserId[merged['userId']] = merged;

    if (!byType[merged['type']])
        byType[merged['type']] = {};
    if (byType[merged['type']][merged['integrationType']])
        throw new Error("Duplicate type " + merged['type'] + " (" + merged['integrationType'] + ") at key " + key);
    byType[merged['type']][merged['integrationType']] = merged;
}

log.info("Integrations", "Loaded " + linear.length + " integrations");

module.exports = {
    all: linear,
    byUserId: byUserId,
    byType: byType
};