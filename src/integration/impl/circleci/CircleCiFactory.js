var CircleCiBot = require("./CircleCiBot");
var VectorCircleCiBackbone = require("./VectorCircleCiBackbone");
var UpstreamConfiguration = require("../../../UpstreamConfiguration");

var factory = (db, integrationConfig, roomId, scalarToken) => {
    factory.validateConfig(integrationConfig);

    return db.getUpstreamToken(scalarToken).then(upstreamToken => {
        var backbone = new VectorCircleCiBackbone(roomId, upstreamToken);
        return new CircleCiBot(integrationConfig, backbone);
    });
};

factory.validateConfig = (integrationConfig) => {
    if (!integrationConfig.upstream) throw new Error("Unsupported configuration");
    if (integrationConfig.upstream.type !== "vector") throw new Error("Unsupported upstream");
    if (!UpstreamConfiguration.hasUpstream("vector")) throw new Error("Vector upstream not specified");
};

module.exports = factory;