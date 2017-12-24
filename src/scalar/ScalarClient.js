"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var request = require("request");
var matrix_js_snippets_1 = require("matrix-js-snippets");
var ScalarClient = /** @class */ (function () {
    function ScalarClient(upstream) {
        this.upstream = upstream;
    }
    ScalarClient.prototype.register = function (openId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            request({
                method: "POST",
                url: _this.upstream.scalarUrl + "/register",
                json: openId,
            }, function (err, res, _body) {
                if (err) {
                    matrix_js_snippets_1.LogService.error("ScalarClient", "Error registering for token");
                    matrix_js_snippets_1.LogService.error("ScalarClient", err);
                    reject(err);
                }
                else if (res.statusCode !== 200) {
                    matrix_js_snippets_1.LogService.error("ScalarClient", "Got status code " + res.statusCode + " while registering for token");
                    reject(new Error("Could not get token"));
                }
                else {
                    resolve(res.body);
                }
            });
        });
    };
    return ScalarClient;
}());
exports.ScalarClient = ScalarClient;
//# sourceMappingURL=ScalarClient.js.map