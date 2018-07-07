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
    if (names.has(format)) {
        return names.get(format) || format;
    } else {
        if ((/^gen[0-9]+.*$/).test(format)) {
            let gen = "";
            let f = "";
            for (let i = 3; i < format.length; i++) {
                if (/[0-9]/.test(format.charAt(i))) {
                    gen += format.charAt(i);
                } else {
                    f = format.substr(i);
                    break;
                }
            }
            return "[Gen " + gen + "] " + getFormatName(f);
        } else if ((/^.+suspecttest$/).test(format)) {
            const f = format.substr(0, format.length - "suspecttest".length);
            return getFormatName(f) + " (suspect test)";
        } else if ((/^monotypemono.+$/).test(format)) {
            const t = format.substr("monotypemono".length);
            return "Monotype (Mono-" + t.charAt(0).toUpperCase() + t.substr(1) + ")";
        } else {
            return format;
        }
    }

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
