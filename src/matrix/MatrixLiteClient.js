"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var MatrixLiteClient = /** @class */ (function () {
    function MatrixLiteClient(homeserverName, accessToken) {
        this.homeserverName = homeserverName;
        this.accessToken = accessToken;
    }
    MatrixLiteClient.prototype.getUrlPreview = function (url) {
        return helpers_1.doFederatedApiCall("GET", this.homeserverName, "/_matrix/media/r0/preview_url", { access_token: this.accessToken, url: url }).then(function (response) {
            return response;
        });
    };
    return MatrixLiteClient;
}());
exports.MatrixLiteClient = MatrixLiteClient;
//# sourceMappingURL=MatrixLiteClient.js.map