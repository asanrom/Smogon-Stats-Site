/**
 * Formats list parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { findAllLinks } from "../utils/links";
import { toId } from "../utils/text-utils";

/**
 * Represents a format.
 */
export interface IFormat {
    name: string;
    id: string;
    baseline: number;
}

/**
 * Parses a formats list.
 * @param html  Raw HTML code to parse.
 * @returns     The list of formats.
 */
export function parseFormatsList(html: string): IFormat[] {
    const list = [];
    findAllLinks(html).forEach((link) => {
        if ((/^.*-[0-9]+\.txt$/).test(link)) {
            const indexDash = link.lastIndexOf("-");
            const name = link.substr(0, indexDash);
            const baseline = parseInt(link.substr(indexDash + 1).split(".")[0], 10);
            list.push({
                baseline,
                id: toId(name),
                name,
            });
        }
    });
    return list;
}
