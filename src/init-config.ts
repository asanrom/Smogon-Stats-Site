/**
 * Configuration initialization.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Configuration script. Run after installing dependencies.
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";

if (!FS.existsSync(Path.resolve(__dirname, "../config.json"))) {
    FS.copyFileSync(Path.resolve(__dirname, "../config-example.json"), Path.resolve(__dirname, "../config.json"));
    console.log("Created configuration file: " + Path.resolve(__dirname, "../config.json"));
}
