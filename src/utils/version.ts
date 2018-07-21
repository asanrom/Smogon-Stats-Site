/**
 * Package Version
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";

const Package = JSON.parse(
    FS.readFileSync(Path.resolve(__dirname, "../../package.json")).toString(),
);

/**
 * Gets the package version.
 */
export function pkgVersion(): string {
    return Package.version || "v0.0";
}
