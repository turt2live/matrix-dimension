var IRCBridge = require("./IRCBridge");
var VectorIrcBackbone = require("./VectorIrcBackbone");

module.exports = (db, integrationConfig, roomId, scalarToken) => {
    if (integrationConfig.upstream) {
        if (integrationConfig.upstream.type !== "vector") throw new Error("Unsupported upstream");
        return db.getUpstreamToken(scalarToken).then(upstreamToken => {
            var backbone = new VectorIrcBackbone(roomId, upstreamToken);
            return new IRCBridge(integrationConfig, backbone);
        });
    } else throw new Error("Unsupported config");
};