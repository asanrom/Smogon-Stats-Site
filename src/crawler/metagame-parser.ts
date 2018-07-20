/**
 * Usage data tables parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { FormatMetagame } from "../model/format-metagame";
import { IPlayStyle } from "../model/interfaces";
import { toId } from "../utils/text-utils";

/**
 * Parses a percent string.
 * @param str   The percent as string.
 * @returns     The percent value as a number.
 */
function parsePercent(str) {
    return parseFloat((str || "").replace("%", "").trim());
}

/**
 * Parses a playstyle line.
 * @param line  Playstyle line to parse.
 * @returns     The parsed playstyle data.
 */
function parsePlaystyle(line: string): IPlayStyle {
    const result: IPlayStyle = {
        name: "",
        usage: 0,
    };
    let j = 0;

    for (let i = 0; i < line.length; i++) {
        const c = line.charAt(i);
        if (c === ".") {
            j = i;
            break;
        }
        result.name = result.name + c;
    }

    for (let i = j; i < line.length; i++) {
        const c = line.charAt(i);
        if (c !== ".") {
            j = i;
            break;
        }
    }

    result.usage = parsePercent(line.substr(j));
    result.name = toId(result.name);

    return result;
}

/**
 * Parses the metagame information of a format.
 * @param txt   The raw metagame data to parse.
 * @returns     The metagame parsed data.
 */
export function parseMetagameInformation(txt: string): FormatMetagame {
    const result: FormatMetagame = new FormatMetagame(null);
    const lines = txt.split("\n");

    let lastLine = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            lastLine = i;
            break;
        }
        result.playstyles.push(parsePlaystyle(line));
    }

    let hashtagVal = 1;
    for (let i = lastLine; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.indexOf("Stalliness") === 0) {
            result.meanStalliness = parseFloat((line.split(":")[1] + "")
                .replace(/[^0-9\.-]/g, "").trim());
        } else if (line.indexOf("one #") === 0) {
            hashtagVal = parseFloat((line.split("=")[1] + "")
                .replace(/[^0-9\.-]/g, "").trim());
        }
    }

    for (let i = lastLine; i < lines.length; i++) {
        const line = lines[i].trim();
        const parts = line.split("|");
        if (parts.length === 2) {
            const val = parseFloat(parts[0].trim());
            const count = parts[1].trim().length;
            result.graph.push({ value: val, p: (count * hashtagVal) });
        }
    }

    /*for (let i = 0; i < result.graph.length; i++) {
        if (isNaN(result.graph[i].value)) {
            if (i === 0 && result.graph.length > 1) {
                result.graph[i].value = result.graph[i + 1].value - 0.25;
            } else if (i !== 0) {
                result.graph[i].value = result.graph[i - 1].value + 0.25;
            }
        }
    }*/

    return result;
}
