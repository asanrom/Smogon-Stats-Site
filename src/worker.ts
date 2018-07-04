/**
 * Worker process
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Util from "util";
import { SmogonUsageStatsSite } from "./app";
import { CrashGuard } from "./crashguard";
import { Storage } from "./storage/storage";
import { Logger } from "./utils/logs";

CrashGuard.enable();

Logger.getInstance().info("Worker statrted!");

const app = new SmogonUsageStatsSite();
try {
    app.listen();
} catch (err) {
    Logger.getInstance().error(err);
    process.send({ type: "fatal", msg: (err.code + " - " + err.message) });
}

process.on("message", (message) => {
    switch (message.type) {
        case "reload-months":
            Storage.cache.remove("stats.months");
            break;
        case "reload-crawler-status":
            Storage.cache.remove("crawler.status");
            break;
        case "reload":
            Storage.cache.clear();
            break;
    }
});
