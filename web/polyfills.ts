import "core-js/client/shim";
import "reflect-metadata";
import "ts-helpers";
//noinspection TypeScriptUnresolvedFunction
require('zone.js/dist/zone');

//noinspection TypeScriptUnresolvedVariable
if (process.env.ENV === 'build') {
    // Production

} else {
    // Development

    Error['stackTraceLimit'] = Infinity;

    //noinspection TypeScriptUnresolvedFunction
    require('zone.js/dist/long-stack-trace-zone');
}
