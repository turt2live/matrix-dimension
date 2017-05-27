var log = require("./src/util/LogService");
var Dimension = require("./src/Dimension");
var DimensionStore = require("./src/storage/DimensionStore");

log.info("app", "Bootstrapping Dimension...");
var db = new DimensionStore();
db.prepare().then(() => {
    var app = new Dimension(db);
    app.start();
}, err => log.error("app", err)).catch(err => log.error("app", err));