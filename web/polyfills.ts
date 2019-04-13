import "reflect-metadata";
import "ts-helpers";
require("zone.js/dist/zone");

//noinspection TypeScriptUnresolvedVariable
if (process.env.ENV === "build") {
    // Production

} else {
    // Development

    Error["stackTraceLimit"] = Infinity;

    //noinspection TypeScriptUnresolvedFunction
    require("zone.js/dist/long-stack-trace-zone");
}
