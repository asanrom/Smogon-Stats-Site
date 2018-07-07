/**
 * Months list parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IMonthStatus } from "../model/interfaces";
import { findAllLinks } from "../utils/links";
import { Logger } from "../utils/logs";

/**
 * Parses a months list.
 * @param html  Raw HTML code to parse.
 * @returns     The list of months.
 */
export function parseMonthsList(html: string): IMonthStatus[] {
    const list: IMonthStatus[] = [];
    findAllLinks(html).forEach((link) => {
        // console.log(link);
        if ((/^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\/$/).test(link)) {
            const year = parseInt(link.substr(0, 4), 10);
            const month = parseInt(link.substr(5, 2), 10);
            if (month < 1 || month > 12) {
                Logger.getInstance().warning("Invalid month (rare): " + link);
                return;
            }
            list.push({
                mid: (year * 12) + month,
                month,
                status: "new",
                visible: false,
                year,
            });
        }
    });
    return list;
}
