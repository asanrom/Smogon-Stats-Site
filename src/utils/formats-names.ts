/**
 * Names for formats
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";
import { Logger } from "./logs";
import { toId } from "./text-utils";

const names: Map<string, string> = new Map();

/**
 * Obtains the name for a format.
 * @param format    Format identifier.
 * @returns         The format name.
 */
export function getFormatName(format: string) {
    format = toId(format);
    return names.get(format) || format;
}

/**
 * Reloads the formats names.
 */
export function reloadNames() {
    names.clear();
    FS.readFile(Path.resolve(__dirname, "../../resources/names-formats.txt"), (err, data) => {
        if (err) {
            Logger.getInstance().error(err);
        } else {
            const lines = data.toString().split("\n");
            for (const line of lines) {
                const id = toId(line);
                if (id) {
                    names.set(id, line.trim());
                }
            }
        }
    });
}

reloadNames();
