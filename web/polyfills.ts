import "reflect-metadata";
import "ts-helpers";
import { environment } from './environments/environment';

require("zone.js/dist/zone");

//noinspection TypeScriptUnresolvedVariable
if (environment.production) {
    // Production

} else {
    // Development

    Error["stackTraceLimit"] = Infinity;

    //noinspection TypeScriptUnresolvedFunction
    require("zone.js/dist/long-stack-trace-zone");
}
