/**
 * Worker process
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { SmogonUsageStatsSite } from "./app";
import { CrashGuard } from "./crashguard";
import { Storage } from "./storage/storage";
import { reloadNames } from "./utils/formats-names";
import { Language } from "./utils/languages";
import { Logger } from "./utils/logs";
import { PokemonData } from "./utils/pokemon-data";

CrashGuard.enable();

Logger.getInstance().info("Worker started!");

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
        case "clear-cache":
            Storage.cache.clear();
            break;
        case "reload":
            reloadNames();
            PokemonData.load();
            Language.loadLanguages();
            break;
    }
});
