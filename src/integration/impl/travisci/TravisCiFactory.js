var TravisCiBot = require("./TravisCiBot");
var VectorTravisCiBackbone = require("./VectorTravisCiBackbone");

module.exports = (db, integrationConfig, roomId, scalarToken) => {
    if (integrationConfig.upstream) {
        if (integrationConfig.upstream.type !== "vector") throw new Error("Unsupported upstream");
        return db.getUpstreamToken(scalarToken).then(upstreamToken => {
            var backbone = new VectorTravisCiBackbone(roomId, upstreamToken);
            return new TravisCiBot(integrationConfig, backbone);
        });
    } else throw new Error("Unsupported config");
};