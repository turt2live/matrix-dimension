var RSSBot = require("./RSSBot");
var VectorRssBackbone = require("./VectorRssBackbone");

module.exports = (db, integrationConfig, roomId, scalarToken) => {
    if (integrationConfig.upstream) {
        if (integrationConfig.upstream.type !== "vector") throw new Error("Unsupported upstream");
        return db.getUpstreamToken(scalarToken).then(upstreamToken => {
            var backbone = new VectorRssBackbone(roomId, upstreamToken);
            return new RSSBot(integrationConfig, backbone);
        });
    } else throw new Error("Unsupported config");
};