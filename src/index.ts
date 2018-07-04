/**
 * Main script
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Cluster from "cluster";
import * as Path from "path";
import * as Util from "util";
import { Config } from "./config";
import { CrashGuard } from "./crashguard";
import { AbuseMonitor } from "./utils/abuse-monitor";
import { Logger } from "./utils/logs";

const Package = require("./../package.json");
console.log("Smogon Stats Site @ Version " + Package.version);

Logger.getInstance().setPath(Config.logsPath);

const processes = {
    crawler: null,
    workers: new Map(),
};

/**
 * Spawns a crawler child process.
 */
function spawnCrawler() {
    Cluster.setupMaster({
        args: [Config.configFile],
        exec: Path.resolve(__dirname, "crawler.js"),
    });
    processes.crawler = Cluster.fork();
    console.log("Crawler spawned: " + processes.crawler.id);
}

/**
 * Spawns a worker child process.
 */
function spawnWorker() {
    Cluster.setupMaster({
        args: [Config.configFile],
        exec: Path.resolve(__dirname, "worker.js"),
    });
    const worker = Cluster.fork();
    console.log("Worker spawned: " + worker.id);
    processes.workers.set(worker.id, worker);
}

/**
 * Broadcasts a message to all workers.
 * @param msg Message to broadcast.
 */
function broadcast(msg: any) {
    processes.workers.forEach((worker) => {
        worker.send(msg);
    });
}

Cluster.on("exit", (worker, code, signal) => {
    if (processes.crawler && processes.crawler.id === worker.id) {
        console.log("Crawler died! Respawning...");
        spawnCrawler();
    } else {
        console.log("Worker " + worker.id + " died! Respawning...");
        processes.workers.delete(worker.id);
        spawnWorker();
    }
});

const adminLoginAbuse = new AbuseMonitor(3, 5 * 1000, 24 * 60 * 60 * 1000);

adminLoginAbuse.on("lock", (name, reason) => {
    broadcast({ type: "admin-lock", ip: name });
    Logger.getInstance().log("[ADMIN] [LOCK] " + name + " / " + reason);
});

adminLoginAbuse.on("unlock", (name, reason) => {
    broadcast({ type: "admin-unlock", ip: name });
    Logger.getInstance().log("[ADMIN] [LOCK] " + name + " / " + reason);
});

Cluster.on("message", (worker, message, handle) => {
    switch (message.type) {
        case "log":
            if (processes.crawler && processes.crawler.id === worker.id) {
                Logger.getInstance().log("[CRAWLER] " + message.msg);
            } else {
                Logger.getInstance().log("[WORKER " + worker.id + "] " + message.msg);
            }
            break;
        case "fatal":
            console.log("[FATAL] [P " + worker.id + "] " + message.msg);
            Cluster.removeAllListeners();
            process.exit(1);
            break;
        case "clear-cache":
        case "reload":
        case "reload-months":
        case "reload-crawler-status":
        case "admin-token":
        case "admin-token-remove":
            broadcast(message);
            break;
        case "login-try":
            adminLoginAbuse.count(message.ip);
            break;
        case "stop":
            console.log("[STOP] [P " + worker.id + "] " + message.msg);
            Cluster.removeAllListeners();
            process.exit(0);
            break;
        case "crawler":
            if (processes.crawler) {
                processes.crawler.send(message);
            }
            break;
        default:
            Logger.getInstance().warning("Unknown message: " + Util.inspect(message));
    }
});

/* Spawn crawler and workers */

if (typeof Config.numWorkers === "number" && Config.numWorkers > 0
    && !isNaN(Config.numWorkers)) {
    spawnCrawler();
    for (let i = 0; i < Config.numWorkers; i++) {
        spawnWorker();
    }
    CrashGuard.enable();
} else {
    console.log("ERROR: The number of workers must be a number greater then 0");
    process.exit(1);
}
