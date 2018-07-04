/**
 * Months list parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { findAllLinks } from "../utils/links";
import { Logger } from "../utils/logs";

/**
 * Represents the status of a month.
 */
export interface IMonthStatus {
    mid: number;
    year: number;
    month: number;
    status: string;
}

/**
 * Parses a months list.
 * @param html  Raw HTML code to parse.
 * @returns     The list of months.
 */
export function parseMonthsList(html: string): IMonthStatus[] {
    const list = [];
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
                year,
            });
        }
    });
    return list;
}
