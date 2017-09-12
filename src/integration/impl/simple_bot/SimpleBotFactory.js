var SimpleBot = require("./SimpleBot");
var VectorSimpleBackbone = require("./VectorSimpleBackbone");
var HostedSimpleBackbone = require("./HostedSimpleBackbone");
var UpstreamConfiguration = require("../../../UpstreamConfiguration");

var factory = (db, integrationConfig, roomId, scalarToken) => {
    factory.validateConfig(integrationConfig);

    if (integrationConfig.upstream) {
        return db.getUpstreamToken(scalarToken).then(upstreamToken => {
            var backbone = new VectorSimpleBackbone(integrationConfig, upstreamToken);
            return new SimpleBot(integrationConfig, backbone);
        });
    } else if (integrationConfig.hosted) {
        var backbone = new HostedSimpleBackbone(integrationConfig);
        return Promise.resolve(new SimpleBot(integrationConfig, backbone));
    }
};

factory.validateConfig = (integrationConfig) => {
    if (integrationConfig.upstream) {
        if (integrationConfig.upstream.type !== "vector") throw new Error("Unsupported upstream");
        if (!UpstreamConfiguration.hasUpstream("vector")) throw new Error("Vector upstream not specified");
    } else if (!integrationConfig.hosted) throw new Error("Unsupported configuration");
};

module.exports = factory;