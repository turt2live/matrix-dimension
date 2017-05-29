var SimpleBot = require("./SimpleBot");
var VectorSimpleBackbone = require("./VectorSimpleBackbone");
var HostedSimpleBackbone = require("./HostedSimpleBackbone");

module.exports = (db, integrationConfig, roomId, scalarToken) => {
    if (integrationConfig.upstream) {
        if (integrationConfig.upstream.type !== "vector") throw new Error("Unsupported upstream");
        return db.getUpstreamToken(scalarToken).then(upstreamToken => {
            var backbone = new VectorSimpleBackbone(integrationConfig, upstreamToken);
            return new SimpleBot(integrationConfig, backbone);
        });
    } else if (integrationConfig.hosted) {
        var backbone = new HostedSimpleBackbone(integrationConfig);
        return Promise.resolve(new SimpleBot(integrationConfig, backbone));
    } else throw new Error("Unsupported config");
};