/**
 * Static configuration.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";
import { isDef } from "./utils/object-utils";

const DEFAULT_CONFIG_FILE = Path.resolve(__dirname, "../config-example.json");
const CONFIG_FILE = Path.resolve(__dirname, "../config.json");

/**
 * Application configuration.
 */
export class Config {
    public static configFile = "";
    public static debug = false;

    public static portHTTP = 80;
    public static portHTTPS = 443;

    public static bindAddress = null;

    public static certificate = "";
    public static privateKey = "";
    public static redirectSecure = false;

    public static numWorkers = 1;

    public static logsPath = Path.resolve(__dirname, "../logs");

    public static smogonStatsURL = "https://www.smogon.com/stats/";

    public static storageMode = "json";

    public static storagePath = Path.resolve(__dirname, "../data");
    public static mongoURL = "";
    public static mongoOptions = {};

    public static controlPanelUsername = "";
    public static controlPanelPasswdHash = "";
    public static controlPanelPasswdAlgo = "sha256";
    public static controlPanelPasswdSalt = "";

}

if (process.argv[2]) {
    Config.configFile = Path.resolve(__dirname, "..", process.argv[2]);
} else {
    if (FS.existsSync(CONFIG_FILE)) {
        Config.configFile = CONFIG_FILE;
    } else {
        Config.configFile = DEFAULT_CONFIG_FILE;
    }
}

let cofigData = null;

try {
    cofigData = JSON.parse(FS.readFileSync(Config.configFile).toString());
} catch (err) {
    console.log("ERROR: Invalid configuration / " + err.message);
    process.exit(1);
}

if (!cofigData) {
    console.log("ERROR: Invalid configuration");
    process.exit(1);
}

if (isDef(cofigData.debug)) {
    Config.debug = cofigData.debug;
}

if (isDef(cofigData.portHTTP)) {
    Config.portHTTP = cofigData.portHTTP;
}

if (isDef(cofigData.portHTTPS)) {
    Config.portHTTPS = cofigData.portHTTPS;
}

if (isDef(cofigData.bindAddress)) {
    Config.bindAddress = cofigData.bindAddress;
}

if (isDef(cofigData.certificate)) {
    if (cofigData.certificate) {
        Config.certificate = Path.resolve(__dirname, "..", cofigData.certificate);
    } else {
        Config.certificate = "";
    }
}

if (isDef(cofigData.privateKey)) {
    Config.privateKey = Path.resolve(__dirname, "..", cofigData.privateKey);
}

if (isDef(cofigData.redirectSecure)) {
    Config.redirectSecure = cofigData.redirectSecure;
}

if (isDef(cofigData.numWorkers)) {
    Config.numWorkers = cofigData.numWorkers;
}

if (isDef(cofigData.logsPath)) {
    Config.logsPath = Path.resolve(__dirname, "..", cofigData.logsPath);
}

if (isDef(cofigData.smogonStatsURL)) {
    Config.smogonStatsURL = cofigData.smogonStatsURL;
}

if (isDef(cofigData.storageMode)) {
    Config.storageMode = cofigData.storageMode;
}

if (isDef(cofigData.mongoURL)) {
    Config.mongoURL = cofigData.mongoURL;
}

if (isDef(cofigData.mongoOptions)) {
    Config.mongoOptions = cofigData.mongoOptions;
}

if (isDef(cofigData.storagePath)) {
    Config.storagePath = Path.resolve(__dirname, "..", cofigData.storagePath);
}

if (isDef(cofigData.controlPanelUsername)) {
    Config.controlPanelUsername = cofigData.controlPanelUsername;
}

if (isDef(cofigData.controlPanelPasswdHash)) {
    Config.controlPanelPasswdHash = cofigData.controlPanelPasswdHash;
}

if (isDef(cofigData.controlPanelPasswdAlgo)) {
    Config.controlPanelPasswdAlgo = cofigData.controlPanelPasswdAlgo;
}

if (isDef(cofigData.controlPanelPasswdSalt)) {
    Config.controlPanelPasswdSalt = cofigData.controlPanelPasswdSalt;
}
