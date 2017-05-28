var log = require("./src/util/LogService");
var Dimension = require("./src/Dimension");
var DimensionStore = require("./src/storage/DimensionStore");
var DemoBot = require("./src/matrix/DemoBot");
var config = require("config");

log.info("app", "Bootstrapping Dimension...");
var db = new DimensionStore();
db.prepare().then(() => {
    var app = new Dimension(db);
    app.start();

    if (config.get("demobot.enabled")) {
        log.info("app", "Demo bot enabled - starting up");
        var bot = new DemoBot(config.get("demobot.homeserverUrl"), config.get("demobot.userId"), config.get("demobot.accessToken"));
        bot.start();
    }
}, err => log.error("app", err)).catch(err => log.error("app", err));