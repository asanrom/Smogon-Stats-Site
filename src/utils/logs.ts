/**
 * Application logger
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Utilities for working with strings.
 */

"use strict";

import * as Cluster from "cluster";
import * as FS from "fs";
import * as Path from "path";

import { Config } from "../config";
import { addLeftZeros } from "./text-utils";

/**
 * Represents a logger for the application. Uses the Singleton pattern.
 */
export class Logger {

    /**
     * Obtains the Logger singleton instance.
     * @returns     The single Logger instance.
     */
    public static getInstance(): Logger {
        if (Logger.instance === null) {
            Logger.instance = new Logger();
            Logger.instance.setPath(Path.resolve(__dirname, "../../logs/"));
        }
        return Logger.instance;
    }

    private static instance: Logger = null;

    private path: string;
    private logFile: string;
    private logStream: FS.WriteStream;

    /**
     * Creates a new instance of Logger.
     */
    constructor() {
        this.path = "";
        this.logFile = "";
        this.logStream = null;
    }

    /**
     * Changes the logs path.
     * @param path  The logs path to set.
     */
    public setPath(path: string) {
        this.path = path;
        if (!FS.existsSync(this.path)) {
            FS.mkdirSync(this.path);
        }
    }

    /**
     * Gets the logs path.
     * @returns     The logs path.
     */
    public getPath(): string {
        return this.path;
    }

    /**
     * Logs a message.
     * @param msg   A message to log.
     */
    public log(msg: string) {
        if (Cluster.isWorker) {
            process.send({ msg, type: "log" });
            return;
        }
        const logFile = this.getLogFile();
        if (this.logFile !== logFile) {
            if (this.logStream !== null) {
                this.logStream.close();
                this.logStream = null;
            }
            this.logFile = logFile;
            this.logStream = FS.createWriteStream(Path.resolve(this.path, this.logFile), { flags: "a+" });
        } else if (this.logStream !== null) {
            this.logFile = logFile;
            this.logStream = FS.createWriteStream(Path.resolve(this.path, this.logFile), { flags: "a+" });
        }
        this.logStream.write(this.getTimeTag() + " " + msg + "\n");
        if (Config.debug) {
            console.log(this.getTimeTag() + " " + msg);
        }
    }

    /**
     * Logs an information message.
     * @param msg   An information message to log.
     */
    public info(msg: string) {
        this.log("[INFO] " + msg);
    }

    /**
     * Logs a warning message.
     * @param msg   A warning message to log.
     */
    public warning(msg: string) {
        this.log("[WARNING] " + msg);
    }

    /**
     * Logs a debug message.
     * @param msg   A debug message to log.
     */
    public debug(msg: string) {
        if (Config.debug) {
            this.log("[DEBUG] " + msg);
        }
    }

    /**
     * Logs an application error.
     * @param err   Application error to log.
     */
    public error(err: Error) {
        this.log("[APPLICATION ERROR] " + err.name + ": " + err.message + "\n" + err.stack);
    }

    private getLogFile(): string {
        const date = new Date();
        return addLeftZeros(date.getFullYear(), 4)
            + "_" + addLeftZeros(date.getMonth() + 1, 2)
            + "_" + addLeftZeros(date.getDate(), 2) + ".log";
    }

    private getTimeTag(): string {
        const date = new Date();
        return "[" + addLeftZeros(date.getFullYear(), 4)
            + "/" + addLeftZeros(date.getMonth() + 1, 2)
            + "/" + addLeftZeros(date.getDate(), 2) + " "
            + addLeftZeros(date.getHours(), 2) + ":"
            + addLeftZeros(date.getMinutes(), 2) + ":"
            + addLeftZeros(date.getSeconds(), 2) + "]";
    }
}
