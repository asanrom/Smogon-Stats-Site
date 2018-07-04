/**
 * Crashguard
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Avoids the application to crash.
 */
"use strict";

import { Logger } from "./utils/logs";

/**
 * Logs an application error.
 * @param error The uncaught exception.
 */
function logCrash(error: Error) {
    // Logger.getInstance().error(error);
    console.log(error.message);
    console.log(error.stack);
}

/**
 * Avoids the application to crash.
 * Logs the uncaught exceptions.
 */
export class CrashGuard {
    /**
     * Enables the crashguard.
     */
    public static enable() {
        process.on("uncaughtException", logCrash);
    }

    /**
     * Disables the crashguard.
     */
    public static disable() {
        process.removeListener("uncaughtException", logCrash);
    }
}
